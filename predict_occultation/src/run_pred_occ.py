# -*- coding: utf-8 -*-

import json
import os
import pathlib
import shutil
import subprocess
import time
import traceback
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path
from time import sleep

import humanize
import pandas as pd
from asteroid import Asteroid
from dao import (
    AsteroidDao,
    LeapSecondDao,
    PlanetaryEphemerisDao,
    PredictOccultationJobDao,
    PredictOccultationJobResultDao,
    PredictOccultationJobStatusDao,
    StarCatalogDao,
)

try:
    from app import run_pipeline
    from parsl_config import get_config
except Exception as error:
    print("Error: %s" % str(error))
    raise Exception("Predict Occultation pipeline not installed!")

import parsl


class AbortError(Exception):
    """Treatment when the task is aborted."""

    def __init__(self, message=None, exitcode=-1):
        self.message = message
        self.exitcode = exitcode

        if not self.message:
            self.message = "The process is aborted!"

    def __str__(self):
        return str(self.message)


def get_logger(path, filename="refine.log", debug=False):
    import logging
    import os
    import sys

    import colorlog

    # File Handler
    logfile = os.path.join(path, filename)
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
    file_handler = logging.FileHandler(logfile)
    file_handler.setFormatter(formatter)

    # Stdout handler
    consoleFormatter = colorlog.ColoredFormatter("%(log_color)s%(message)s")
    consoleHandler = colorlog.StreamHandler(sys.stdout)
    consoleHandler.setFormatter(consoleFormatter)

    log = logging.getLogger(filename.split(".log")[0])
    log.addHandler(file_handler)
    log.addHandler(consoleHandler)

    if debug:
        log.setLevel(logging.DEBUG)
    else:
        log.setLevel(logging.INFO)

    return log


def job_to_run():
    """Retorna o job com status=1 Idle mas antigo.

    Returns:
        job: Orbit Trace Job model
    """
    dao = PredictOccultationJobDao()
    job = dao.get_job_by_status(1)

    return job


def job_by_id(jobid):
    """Retorna o job pelo jobid.

    Returns:
        job: Orbit Trace Job model
    """
    dao = PredictOccultationJobDao()
    return dao.get_job_by_id(jobid)


def check_abort_job(jobid) -> bool:
    """Checa se o job esta marcado para abortar

    Returns:
        bool: retorna se o job True se o job foi abortado, False se não foi
    """
    job = job_by_id(jobid)

    # status 7 = aborting
    return True if job["status"] == 7 else False


def has_job_running() -> bool:
    """Verifica se há algum job com status = 2 Running.

    Returns:
        bool: True caso haja algum job sendo executado.
    """
    dao = PredictOccultationJobDao()
    job = dao.get_job_by_status(2)

    if job is not None:
        return True
    else:
        return False


def get_job_running():
    """Verifica se há algum job com status = 2 Running.

    Returns:
        Id: Job caso
    """
    dao = PredictOccultationJobDao()
    job = dao.get_job_by_status(2)

    if job is not None:
        return job.get("id")


def update_job_progress(jobid):
    # TODO: Implementação temporaria para atualizar o progresso do job.
    dao_job = PredictOccultationJobDao()
    dao_job_result = PredictOccultationJobResultDao()

    job = dao_job.get_job_by_id(jobid)

    # Total de asteroids
    count_asteroids = job["count_asteroids"]
    # print(f"Job asteroid {count_asteroids}" )

    # Total de tasks submetidas.
    submited_tasks = dao_job_result.count_by_job_id(jobid)
    # print(f"Submited Tasks {submited_tasks}")

    # Job results/tasks status
    # (1, "Idle"),
    # (2, "Running"),
    # (3, "Completed"),
    # (4, "Failed"),
    # (5, "Aborted"),
    # (6, "Warning"),
    # (7, "Aborting"),

    # Update job progress stage 1 - Submission of tasks
    # 3 = completed
    # 2 = running
    stage1_status = 3 if submited_tasks == count_asteroids else 2
    update_progress_status(
        jobid,
        step=1,
        status=stage1_status,
        count=count_asteroids,
        current=submited_tasks,
        # success=step1_success,
        # failures=step1_failures,
        t0=job["start"],
    )

    # Total de tasks completas.
    completed_tasks = dao_job_result.count_by_job_id(jobid, status=[3, 4, 5, 6])
    # print(f"Completed Tasks {completed_tasks}")

    success_tasks = dao_job_result.count_by_job_id(jobid, status=[3])
    # print(f"Success Tasks {success_tasks}")
    failed_tasks = dao_job_result.count_by_job_id(jobid, status=[4])
    # print(f"Failed Tasks {failed_tasks}")

    # Update job progress stage 2 - Running tasks
    stage2_status = 3 if completed_tasks == submited_tasks else 2
    update_progress_status(
        jobid,
        step=2,
        status=stage2_status,
        count=submited_tasks,
        current=completed_tasks,
        success=success_tasks,
        failures=failed_tasks,
        t0=job["start"],
    )


def predict_job_queue():
    # Verifica se ha algum job sendo executado.
    if has_job_running():
        # print("Já existe um job em execução.")
        return

    # Verifica o proximo job com status Idle
    to_run = job_to_run()
    if not to_run:
        # print("Nenhum job para executar.")
        return

    # Inicia o job.
    # print("Deveria executar o job com ID: %s" % to_run.get("id"))
    run_job(to_run.get("id"))


def write_job_file(path, data):
    with open(os.path.join(path, "job.json"), "w") as json_file:
        json.dump(data, json_file)


def make_job_json_file(job, path):
    job_data = dict(
        {
            "id": job.get("id"),
            "status": "Idle",
            "submit_time": job.get("submit_time").astimezone(timezone.utc).isoformat(),
            "estimated_execution_time": str(job.get("estimated_execution_time")),
            "path": str(path),
            "filter_type": job.get("filter_type"),
            "filter_value": job.get("filter_value"),
            "predict_start_date": job.get("predict_start_date").isoformat(),
            "predict_end_date": job.get("predict_end_date").isoformat(),
            "predict_step": job.get("predict_step", 600),
            "debug": bool(job.get("debug", False)),
            "error": None,
            "traceback": None,
            # TODO: Estes parametros devem ser gerados pelo pipeline lendo do config.
            # TODO: Bsp e leap second deve fazer a query e verificar o arquivo ou fazer o download.
            "bsp_planetary": PlanetaryEphemerisDao().get_by_id(
                job["planetary_ephemeris_id"]
            ),
            "leap_seconds": LeapSecondDao().get_by_id(job["leap_second_id"]),
            "star_catalog": StarCatalogDao().get_by_id(job["catalog_id"]),
            "force_refresh_inputs": True,
            "inputs_days_to_expire": 0,
        }
    )

    write_job_file(path, job_data)
    update_job(job_data)


def read_inputs(path, filename="job.json"):
    import json
    import os

    with open(os.path.join(path, filename)) as json_file:
        data = json.load(json_file)

    return data


def remove_job_directory(jobid):
    # Apaga o diretorio usando rm pq o diretorio tem links simbolicos.
    job_path = get_job_path(jobid)
    print(f"Clear Job path: [{job_path}]")
    try:
        shutil.rmtree(job_path, ignore_errors=False)
        print("Removed directory using shutil: [%s]" % job_path)
    except:
        cmd = f"rm -rf {job_path}"
        print(f"Remove directory CMD: [{cmd}]")
        print("Removed directory using rm -rf: [%s]" % job_path)
        os.system(cmd)


def get_job_path(jobid):
    """Retorna o path para o diretorio do job, cria o diretorio caso nao exista."""
    predict_outputs = os.getenv("PREDICT_OUTPUTS")
    print("Predict_outputs: ")
    print(predict_outputs)
    folder_name = f"{jobid}"
    # folder_name = f"teste_{job['id']}"
    # folder_name = f"{job['id']}-{str(uuid.uuid4())[:8]}"

    job_path = pathlib.Path(predict_outputs).joinpath(folder_name)

    if not job_path.exists():
        job_path.mkdir(parents=True, mode=0o775)

        # Parsl Script dir
        script_dir = job_path.joinpath("script_dir")
        script_dir.mkdir(parents=True, mode=0o775)

    return job_path


def retrieve_asteroids(type, values):

    dao = AsteroidDao()

    asteroids = []

    if type == "name":
        asteroids = dao.get_asteroids_by_names(names=values.split(","))
    elif type == "dynclass":
        asteroids = dao.get_asteroids_by_dynclass(dynclass=values)
    elif type == "base_dynclass":
        asteroids = dao.get_asteroids_by_base_dynclass(dynclass=values)

    for asteroid in asteroids:
        asteroid.update(
            {
                "status": "running",
            }
        )

    return asteroids


def rerun_job(jobid: int):
    """Apaga os dados no DB referente ao job e remove o diretorio.
    Altera o status do Job para idle.
    """
    print("------------------- Rerun Job -------------------")
    # Clear Directory
    remove_job_directory(jobid)

    print(f"Rerun Job: [{jobid}]")
    daojob = PredictOccultationJobDao()

    # Faz um update na tabela de job zerando os campos.
    daojob.development_reset_job(jobid)

    daoresult = PredictOccultationJobResultDao()
    daoresult.delete_by_job_id(jobid)

    daostatus = PredictOccultationJobStatusDao()
    daostatus.delete_by_job_id(jobid)

    sleep(1)
    run_job(jobid)
    print("-------------------------------------------------")


def update_job(job) -> None:
    dao = PredictOccultationJobDao()
    dao.update_job(job)

    write_job_file(job.get("path"), job)


def read_job_json_by_id(jobid):
    dao = PredictOccultationJobDao()
    job_db = dao.get_job_by_id(jobid)
    # Read Inputs from job.json
    return read_inputs(job_db["path"], "job.json")


def update_progress_status(
    job_id: int,
    step: int,
    t0: datetime,
    status: int = None,
    count: int = 0,
    current: int = 0,
    success: int = 0,
    failures: int = 0,
):
    t1 = datetime.now(tz=timezone.utc)
    tdelta = t1 - t0
    tdelta = tdelta.total_seconds()
    average_time = 0
    if count > 0:
        average_time = tdelta / count
    time_estimate = tdelta * (count - current)

    tasks = ["Data acquisition and preparation", "Refine Orbit and Predict Occultation"]
    task = tasks[step - 1]

    dao = PredictOccultationJobStatusDao()
    dao.update_or_insert(
        job_id,
        step,
        task,
        status,
        count,
        current,
        average_time,
        time_estimate,
        success,
        failures,
    )


def setup_job_status(jobid, count_asteroids):
    update_progress_status(
        jobid,
        step=1,
        status=2,
        count=count_asteroids,
        current=0,
        success=0,
        failures=0,
        t0=datetime.now(tz=timezone.utc),
    )

    update_progress_status(
        jobid,
        step=2,
        status=2,
        count=count_asteroids,
        current=0,
        success=0,
        failures=0,
        t0=datetime.now(tz=timezone.utc),
    )


def run_job(jobid: int):
    print("run job: %s" % jobid)

    dao = PredictOccultationJobDao()

    job = dao.get_job_by_id(jobid)

    # Cria um diretório para o job
    job_path = get_job_path(job["id"])

    # Escreve o arquivo job.json
    make_job_json_file(job, job_path)

    return submit_tasks(jobid)

    # # Executa o job usando subproccess.
    # env_file = pathlib.Path(os.environ['EXECUTION_PATH']).joinpath('env.sh')
    # proc = subprocess.Popen(
    #     # f"source /lustre/t1/tmp/tno/pipelines/env.sh; python orbit_trace.py {job_path}",
    #     f"source {env_file}; python predict_occultation.py {job_path}",
    #     stdout=subprocess.PIPE,
    #     stderr=subprocess.PIPE,
    #     shell=True,
    #     text=True
    # )

    # [DESENVOLVIMENTO] descomentar este bloco para que o função execute.
    # import time
    # while proc.poll() is None:
    #     print("Shell command is still running...")
    #     time.sleep(1)

    # # When arriving here, the shell command has finished.
    # # Check the exit code of the shell command:
    # print(proc.poll())
    # # 0, means the shell command finshed successfully.

    # # Check the output and error of the shell command:
    # output, error = proc.communicate()
    # print(output)
    # print(error)


def submit_tasks(jobid: int):
    # Read Inputs from job.json
    job = read_job_json_by_id(jobid)

    # Paths de execução
    original_path = os.getcwd()
    current_path = pathlib.Path(job.get("path"))

    DEBUG = job.get("debug", False)

    # Create a Log file
    logname = "submit_tasks"
    log = get_logger(current_path, f"{logname}.log", DEBUG)

    current_idx = 0
    step1_success, step1_failures = 0, 0
    step1_count = 0

    step2_current_idx = 0
    step2_success, step2_failures = 0, 0
    step2_count = 0

    hb_t0 = datetime.now(tz=timezone.utc)

    try:
        # Altera o path de execução
        # A raiz agora é o path passado como parametro.
        os.chdir(current_path)

        # Start Running Time
        t0 = datetime.now(tz=timezone.utc)
        log.info("#============================================================#")
        log.info("|                Predict Occultation Pipeline                |")
        log.info("#============================================================#")
        log.info("Job ID: [%s]" % jobid)
        log.debug("Current Path: [%s]" % current_path)
        log.debug("DEBUG: [%s]" % DEBUG)

        job.update(
            {
                "status": "Running",
                "start": t0.isoformat(),
                "end": None,
                "exec_time": 0,
                "count_asteroids": 0,
                "count_success": 0,
                "count_failures": 0,
                "ast_with_occ": 0,
                "occultations": 0,
                "time_profile": [],
                "submited_all_jobs": False,
                "condor_job_submited": 0,
                "condor_job_completed": 0,
                "condor_job_removed": 0,
                "check_tasks": None,
            }
        )

        log.info("Update Job status to running.")
        update_job(job)

        # =========================== Parameters ===========================

        # ASTEROID_PATH: Diretório onde serão armazenados todos os arquivos referentes
        # aos Asteroids, dentro deste diretório serão criados diretorios para cada
        # Asteroid contendo seus arquivos de inputs e outputs.
        # Atenção: Precisar permitir uma quantidade grande de acessos de leitura e escrita simultaneas.
        ASTEROID_PATH = current_path.joinpath("asteroids")

        # Essa linha foi comentada para permitir a reexecução do job em production
        # ASTEROID_PATH.mkdir(parents=True, exist_ok=DEBUG)
        ASTEROID_PATH.mkdir(parents=True, exist_ok=True)

        log.debug(f"Asteroid PATH: [{ASTEROID_PATH}]")

        # Diretório onde ficam os arquivos BSP por asteroid, estes arquivos são baixados
        # previamente independente do job e permanecem no diretório para serem utilizados novamente.
        # Dentro deste diretório é criado uma pasta por asteroid.
        INPUTS_PATH = Path(os.getenv("PREDICT_INPUTS", "/app/inputs"))

        # Parametros usados na Predição de Ocultação
        # predict_start_date: Data de Inicio da Predição no formato "YYYY-MM-DD". Default = NOW()
        # predict_end_date: Data de Termino da Predição no formato "YYYY-MM-DD". Default = NOW() + 1 Year
        # predict_step: Intervalo em segundos que será usado na ephemeris do objeto durante a predição. default = 600
        PREDICT_START = datetime.now()
        if "predict_start_date" in job and "predict_start_date" != None:
            PREDICT_START = datetime.strptime(job["predict_start_date"], "%Y-%m-%d")
        log.debug("Predict Start Date: [%s]" % PREDICT_START)

        PREDICT_END = PREDICT_START.replace(year=PREDICT_START.year + 1)
        if "predict_end_date" in job and "predict_end_date" != None:
            PREDICT_END = datetime.strptime(job["predict_end_date"], "%Y-%m-%d")
            PREDICT_END = PREDICT_END.replace(hour=23, minute=59, second=59)
        log.debug("Predict End Date: [%s]" % PREDICT_END)

        job.update(
            {
                "predict_start_date": str(PREDICT_START.date()),
                "predict_end_date": str(PREDICT_END.date()),
            }
        )

        PREDICT_STEP = int(job.get("predict_step", 60))
        log.debug("Predict Step: [%s]" % PREDICT_STEP)

        # Utilizar os parametros de BSP_PLanetary e LEAP Second do job.json.
        # TODO: Verificar se os arquivos bsp_planetary e leap_second existem no diretorio do pipeline remoto.
        BSP_PLANETARY = job["bsp_planetary"]["filename"]
        log.debug("BSP_PLANETARY: [%s]" % BSP_PLANETARY)

        LEAP_SECOND = job["leap_seconds"]["filename"]
        log.debug("LEAP_SECOND: [%s]" % LEAP_SECOND)

        STAR_CATALOG = job["star_catalog"]
        log.debug("STAR_CATALOG: [%s]" % STAR_CATALOG["display_name"])

        # =========================== Parsl ===========================
        log.info("Settings Parsl configurations")
        envname = os.getenv("PARSL_ENV", "linea")
        parsl_conf = get_config(envname, current_path)
        # Altera o diretório runinfo para dentro do diretório do job.
        parsl_conf.run_dir = os.path.join(current_path, "runinfo")
        # parsl_conf.executors[0].provider.channel.script_dir = os.path.join(
        #         current_path, "script_dir"
        #     )

        parsl.clear()
        parsl.load(parsl_conf)

        # ======================= Generate dates file =======================
        # Arquivo de datas pode ser o mesmo para todos os asteroids.
        # Executa o programa fortran geradata.
        # O arquivo de datas será copiado para cada asteroid.
        log.info(f"Generating dates file.")
        step_t0 = datetime.now(tz=timezone.utc)
        dates_filepath = generate_dates_file(
            PREDICT_START,
            PREDICT_END,
            PREDICT_STEP,
            current_path.joinpath("dates.txt"),
            log,
        )
        step_t1 = datetime.now(tz=timezone.utc)
        step_tdelta = step_t1 - step_t0
        log.debug(f"Dates file: [{dates_filepath.name}] created in {step_tdelta}")

        # =========================== Asteroids ===========================
        # Retrieve Asteroids.
        log.info("Retriving Asteroids started")

        step_t0 = datetime.now(tz=timezone.utc)

        asteroids = retrieve_asteroids(job["filter_type"], job["filter_value"])

        # asteroids = asteroids[0:10]

        step_t1 = datetime.now(tz=timezone.utc)
        step_tdelta = step_t1 - step_t0

        job.update({"count_asteroids": len(asteroids)})

        setup_job_status(jobid, len(asteroids))

        log.debug("Asteroids Count: %s" % job["count_asteroids"])

        log.info(
            "Retriving Asteroids Finished in %s"
            % humanize.naturaldelta(step_tdelta, minimum_unit="microseconds")
        )

        # Update Job File
        update_job(job)

        if job["count_asteroids"] == 0:
            raise Exception(
                "No asteroid satisfying the criteria %s and %s. There is nothing to run."
                % (job["filter_type"], job["filter_value"])
            )

        hb_t0 = datetime.now(tz=timezone.utc)

        jobs_asteroids = []

        workdir = os.getenv("PIPELINE_PREDIC_OCC")
        log.debug(f"Workdir: [{workdir}]")
        # db_admin_uri = os.getenv("DB_ADMIN_URI")
        # log.debug(f"DB Admin URI: [{db_admin_uri}]")

        step1_count = len(asteroids)

        dao_job_result = PredictOccultationJobResultDao()

        for asteroid in asteroids:
            log.info(
                "---------------< Submiting: %s / %s >---------------"
                % (current_idx + 1, step1_count)
            )
            log.info("Asteroid: [%s]" % asteroid["name"])

            is_abort = check_abort_job(jobid)
            if is_abort:
                raise AbortError("Job ID %s aborted!" % str(jobid), -1)

            # Ao instanciar a Classe Asteroid, o diretório do asteroid será criado
            # e um arquivo json com as informações do asteroid será criado.
            a = Asteroid(
                name=asteroid["name"],
                base_path=ASTEROID_PATH,
                log=log,
                # Remove Arquivos da execução anterior, inputs, resultados e logs
                # Necessário em dev quando se está usando rerun
                new_run=True,
                inputs_path=INPUTS_PATH,
            )

            a.set_job_id(int(jobid))

            # ========================= Download dos Inputs Externos ============================

            # Dates File ----------------------------------------------------
            log.info(f"Copying dates.txt file to asteroid directory.")
            ast_dates_file = pathlib.Path(a.get_path()).joinpath("dates.txt")
            shutil.copy(dates_filepath, ast_dates_file)
            log.debug(f"Asteorid Date file: [{ast_dates_file}].")

            # BSP JPL -------------------------------------------------------
            # Caso HAJA posições para o DES o BSP precisará ter um periodo inicial que contenham o periodo do DES
            # Para isso basta deixar o bsp_start_date = None e o periodo será setado na hora do download.
            # Se NÃO tiver posições no DES o BSP tera como inicio a data solicitada para predição.
            bsp_start_date = str(PREDICT_START.date())
            bsp_end_date = str(PREDICT_END.date())
            have_bsp_jpl = a.check_bsp_jpl(
                start_period=bsp_start_date,
                end_period=bsp_end_date,
            )

            # TODO: Duvida fazer o download do bsp? caso ele não exista para manter a
            # compatibilidade com versão anterior
            if not have_bsp_jpl:
                try:
                    a.download_jpl_bsp(
                        start_period=bsp_start_date,
                        end_period=bsp_end_date,
                    )
                except Exception as e:
                    log.error(f"Error downloading BSP JPL: {str(e)}")

                # checa novamente o bsp
                if not a.check_bsp_jpl(
                    start_period=bsp_start_date,
                    end_period=bsp_end_date,
                ):

                    log.warning(
                        "Asteroid [%s] Ignored for not having BSP JPL."
                        % asteroid["name"]
                    )

                    current_idx += 1
                    step1_failures += 1

                    # Registra na tabela results que o asteroid foi ignorado.
                    dao_job_result.insert(
                        {
                            "name": a.name,
                            "number": a.number,
                            "base_dynclass": a.base_dynclass,
                            "dynclass": a.dynclass,
                            "status": 2,  # Failed
                            "job_id": jobid,
                            "messages": "Asteroid Ignored for not having BSP JPL.",
                        }
                    )

                    # Ignora as proximas etapas para este asteroid.
                    continue

            # TODO: Por enquanto estamos Copiando o BSP JPL para pasta do Asteroid.
            log.info(f"Copying bsp file to asteroid directory.")
            ast_bsp_origin = pathlib.Path(a.get_bsp_path()).parent
            ast_bsp_destiny = pathlib.Path(a.get_path())
            for file in ast_bsp_origin.iterdir():
                file_destiny = ast_bsp_destiny.joinpath(file.name)
                log.debug(f"Coping: {file} -> {file_destiny}")
                shutil.copyfile(file, file_destiny)

            # STAR CATALOG
            a.set_star_catalog(**STAR_CATALOG)

            step1_success += 1
            current_idx += 1

            # update_progress_status(
            #     jobid,
            #     step=1,
            #     status=2,
            #     count=len(asteroids),
            #     current=current_idx,
            #     success=step1_success,
            #     failures=step1_failures,
            #     t0=hb_t0,
            # )

            # ======================= Submeter o Job por asteroide ==========================
            # Adicionar os asteroids a tabela job result ( que agora passa a representar as job tasks.)
            # Cada asteroid será adicionado com status queued e depois atualizado para running e depois para completed.
            # Cada asteroid terá um job_id que será o id do job principal.
            task_id = dao_job_result.insert(
                {
                    "name": a.name,
                    "number": a.number,
                    "base_dynclass": a.base_dynclass,
                    "dynclass": a.dynclass,
                    "status": 3,  # Queued
                    "job_id": jobid,
                }
            )
            a.set_task_id(task_id)

            log.debug(f"Task ID:  {task_id}")
            log.debug("Submitting the Job. [%s]" % str(a.get_path()))
            start_date = str(PREDICT_START.date())
            end_date = str(PREDICT_END.date())
            name = a.alias
            path = str(a.get_path())

            try:
                # TODO: Passar como parametro apenas o path e o nome do arquivo json.
                # Demais parametros podem ser lidos do arquivo json.
                proc = run_pipeline(
                    (
                        workdir,
                        name,
                        start_date,
                        end_date,
                        path,
                        PREDICT_STEP,
                        LEAP_SECOND,
                        BSP_PLANETARY,
                    ),
                    stderr=f"{path}/{name}.err",
                    stdout=f"{path}/{name}.out",
                )
                asteroid["job"] = proc
                asteroid["done"] = False
                jobs_asteroids.append(asteroid)

            except Exception:
                step2_failures = +1
                log.error("Error running asteroid %s" % name)
                continue

        # update_progress_status(
        #     jobid,
        #     step=1,
        #     status=3,
        #     count=len(asteroids),
        #     current=current_idx,
        #     success=step1_success,
        #     failures=step1_failures,
        #     t0=hb_t0,
        # )

        log.info("All jobs have been submitted.")

        # update_progress_status(
        #     jobid,
        #     step=2,
        #     status=2,
        #     count=len(jobs_asteroids),
        #     current=step2_current_idx,
        #     success=step2_success,
        #     failures=step2_failures,
        #     t0=hb_t0,
        # )

        log.debug(f"Jobs to Parsl: [{len(jobs_asteroids)}]")

        # # Monitoramento parcial das tasks
        is_done = []
        step2_count = len(jobs_asteroids)

        while is_done.count(True) != step2_count:
            is_done = []
            is_abort = check_abort_job(jobid)
            # log.debug("IS ABORT: %s" % str(is_abort))
            for proc in jobs_asteroids:
                task = proc.get("job")
                proc_is_done = task.done()

                if is_abort and not proc_is_done:
                    task.set_exception(
                        AbortError("Asteroid %s aborted!" % str(proc["name"]), -1)
                    )

                if not proc.get("done", False) and proc_is_done:
                    proc["done"] = proc_is_done
                    errobj = task.exception()

                    if errobj:
                        try:
                            status = errobj.exitcode
                        except AttributeError:
                            status = -1
                        log.warn("JobParslError: %s" % str(status))
                    else:
                        status = task.result()

                    step2_current_idx += 1

                    if status:
                        step2_failures += 1
                        log.warning(
                            "Asteroid [%s] - Bash exit with code %s"
                            % (proc["name"], str(status))
                        )
                    else:
                        step2_success += 1

                is_done.append(proc.get("done"))
            # log.debug(
            #     "Predict Occultation Parsl Task Running: %s/%s"
            #     % (is_done.count(True), len(jobs_asteroids))
            # )
            # log.debug("N# FAILED: %i" % step2_failures)
            # log.debug("N# SUCCESSED: %i" % step2_success)
            time.sleep(5)

        is_abort = check_abort_job(jobid)
        if is_abort:
            raise AbortError("Job ID %s aborted!" % str(jobid), -1)

        # update_progress_status(
        #     jobid,
        #     step=2,
        #     status=3,
        #     count=len(jobs_asteroids),
        #     current=step2_current_idx,
        #     success=step2_success,
        #     failures=step2_failures,
        #     t0=hb_t0,
        # )

        job.update({"status": "Completed"})
    except AbortError as e:
        trace = traceback.format_exc()
        log.error(trace)
        log.error("ABORT ERROR: %s" % e)

        # TODO: alterar o status de todas as tasks para abortado.

        # Status 4 = Failed
        job.update(
            {
                "status": "Aborted",
                "error": str(e),
                "traceback": str(trace),
            }
        )

        # update_progress_status(
        #     jobid,
        #     step=1,
        #     status=5,
        #     count=step1_count,
        #     current=current_idx,
        #     success=step1_success,
        #     failures=step1_failures,
        #     t0=hb_t0,
        # )

        # update_progress_status(
        #     jobid,
        #     step=2,
        #     status=5,
        #     count=step2_count,
        #     current=step2_current_idx,
        #     success=step2_success,
        #     failures=step2_failures,
        #     t0=hb_t0,
        # )

    except Exception as e:
        trace = traceback.format_exc()
        log.error(trace)
        log.error(e)

        # Status 4 = Failed
        job.update(
            {
                "status": "Failed",
                "error": str(e),
                "traceback": str(trace),
            }
        )

        # update_progress_status(
        #     jobid,
        #     step=1,
        #     status=4,
        #     count=step1_count,
        #     current=current_idx,
        #     success=step1_success,
        #     failures=step1_failures,
        #     t0=hb_t0,
        # )

        # update_progress_status(
        #     jobid,
        #     step=2,
        #     status=4,
        #     count=step2_count,
        #     current=step2_current_idx,
        #     success=step2_success,
        #     failures=step2_failures,
        #     t0=hb_t0,
        # )

    finally:
        log.debug("-----------------------------------------------")
        log.debug("Job completed - Update Progress bar step2")

        job.update({"submited_all_jobs": True, "condor_job_submited": len(asteroids)})
        update_job(job)

        consolidate_job_results(job, current_path, log)

        complete_job(job, log, job.get("status", "Completed"))

        os.chdir(original_path)
        parsl.clear()
        return True


def consolidate_job_results(job, job_path, log):

    log.info("Consolidating Job Results.")
    dao = PredictOccultationJobResultDao()
    results = dao.by_job_id(job["id"])

    df_result = pd.DataFrame(
        results,
        columns=[
            "name",
            "number",
            "base_dynclass",
            "dynclass",
            "status",
            "occultations",
            "exec_time",
            "messages",
            "pre_occ_start",
            "pre_occ_finish",
            "pre_occ_exec_time",
            "calc_path_coeff_start",
            "calc_path_coeff_finish",
            "calc_path_coeff_exec_time",
            "ing_occ_count",
            "ing_occ_start",
            "ing_occ_finish",
            "ing_occ_exec_time",
            "job_id",
            "stars",
        ],
    )

    result_filepath = pathlib.Path(job_path, "job_consolidated.csv")
    mode = "a"
    header = False

    if not result_filepath.exists():
        mode = "w"
        header = True
    df_result.to_csv(
        result_filepath,
        encoding="utf-8",
        sep=";",
        index=False,
        mode=mode,
        header=header,
    )
    del df_result
    log.info("File with the consolidated Job data. [%s]" % result_filepath)


def complete_job(job, log, status):
    consolidated_filepath = pathlib.Path(job.get("path"), "job_consolidated.csv")

    if not consolidated_filepath.exists():
        raise Exception(f"Consolidated file not exists. [{consolidated_filepath}]")

    df = pd.read_csv(consolidated_filepath, delimiter=";")

    l_status = df["status"].to_list()
    count_success = int(l_status.count(1))
    count_failures = int(l_status.count(2))
    occultations = int(df["occultations"].sum())
    ast_with_occ = int((df["occultations"] != 0).sum())

    t0 = datetime.fromisoformat(job.get("start"))
    t1 = datetime.now(tz=timezone.utc)
    tdelta = t1 - t0

    # Calc average time by asteroid
    avg_exec_time_asteroid = 0
    if count_success > 0:
        avg_exec_time_asteroid = int(tdelta.total_seconds() / count_success)

    # Status 3 = Completed
    job.update(
        {
            "status": status,
            "ast_with_occ": ast_with_occ,
            "occultations": occultations,
            "count_success": count_success,
            "count_failures": count_failures,
            "end": t1.isoformat(),
            "exec_time": tdelta.total_seconds(),
            "h_exec_time": humanize.naturaldelta(tdelta),
            "avg_exec_time": avg_exec_time_asteroid,
        }
    )

    log.info("Update Job status.")
    # write_job_file(current_path, job)
    update_job(job)

    # Update Job Progress
    update_job_progress(job["id"])

    # Remove o diretório de asteroids do job.
    if not job["debug"]:
        log.debug("Removing asteroid directory.")
        asteroid_path = pathlib.Path(job["path"]).joinpath("asteroids")
        shutil.rmtree(asteroid_path)
        log.info("Directory of asteroids has been removed!")

    log.debug(f"Total Asteroids: [{job['count_asteroids']}]")
    log.debug(f"Asteroids Success: [{count_success}]")
    log.debug(f"Asteroids Failure: [{count_failures}]")
    log.debug(f"Asteroids With Events: [{ast_with_occ}]")
    log.info(f"Predict Events: [{occultations}]")

    log.info("Execution Time: %s" % tdelta)
    log.info("Predict Occultation is done!.")


def generate_dates_file(
    start_date: str, final_date: str, step: int, filepath: pathlib.Path, log
):

    original_path = os.getcwd()

    try:
        # Altera o path de execução
        # A raiz agora é o path passado como parametro.
        pipeline_path = os.getenv(
            "PIPELINE_PATH", "/app/src/predict_occultation/pipeline"
        ).rstrip("/")
        log.debug(f"Changing path to PIPELINE_PATH: [{pipeline_path}]")
        os.chdir(pipeline_path)

        with open(filepath, "w") as fp:
            parameters = [start_date, final_date, step]
            strParameters = "\n".join(map(str, parameters))
            p = subprocess.Popen(
                "geradata", stdin=subprocess.PIPE, stdout=fp, shell=True
            )
            p.communicate(str.encode(strParameters))

            log.debug(
                "Geradata Command: [geradata %s]" % strParameters.replace("\n", " ")
            )

        if filepath.exists():
            filepath.chmod(0o664)
            return filepath
        else:
            raise Exception(f"Date file not generated.")

    except Exception as e:
        raise Exception(f"Failed in the geradata step. [{e}]")
    finally:
        log.debug(f"Changing to Orinal job path: [{original_path}]")
        os.chdir(original_path)
