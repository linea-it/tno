import json
import logging
import os
import pathlib
import shutil
import traceback
from datetime import datetime, timedelta, timezone
from statistics import mean

import dateutil.parser
import humanize
import pandas as pd
import pytz
from common.notify import Notify
from des.dao import CcdDao, DesSkybotJobDao, DesSkybotJobResultDao, ExposureDao
from des.models import SummaryDynclass
from des.skybot.import_positions import DESImportSkybotPositions
from des.summary import SummaryResult
from django.conf import settings
from skybot.skybot_server import SkybotServer
from tno.dao.asteroids import AsteroidDao


class AbortSkybotJobError(Exception):
    pass


class DesSkybotPipeline:
    def __init__(self):
        self.logger = logging.getLogger("skybot")
        self.logger_import = logging.getLogger("skybot_load_data")

        # Timeout em segundos
        self.timeout = 600

        # Diretorio onde ficam os csv baixados do skybot
        self.base_path = settings.SKYBOT_OUTPUT

        # Radius usado na query do skybot com tamanho suficiente para a exposição do des.
        # Cone search radius in Degres
        self.radius = 1.2

        # Date Correction for DECam
        self.date_correction = 1.05

        # Observer Code for Cerro Tololo-DECam
        self.observer_location = "w84"

        # Filter to retrieve only objects with a position error lesser than the given value
        self.position_error = 0

        self.spdao = DesSkybotJobDao(pool=False)

        self.epdao = ExposureDao(pool=False)

        self.dsdao = DesSkybotJobResultDao(pool=False)

        self.ccddao = CcdDao(pool=False)

        self.attempts_on_fail_by_exposure = 1

    def get_job_by_id(self, id):
        return self.spdao.get_by_id(id)

    def update_job(self, job):
        return self.spdao.update_by_id(job["id"], job)

    def complete_job(self, job):
        return self.spdao.complete_job(job["id"], job)

    def create_skybot_log(self, job_path):
        """Cria um arquivo de log no diretório execução do Job.
        Este log é uma cópia do log definido no settings.
        Neste log estão as informações sobre as requisições.
        Arguments:
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']
        """
        # Adiciona um Log Handle para fazer uma copia do log no diretório do processo.
        fh = logging.FileHandler(os.path.join(job_path, "skybot_requests.log"))
        formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
        fh.setFormatter(formatter)
        self.logger.addHandler(fh)
        self.logger.setLevel(settings.LOGGING_LEVEL)
        self.logger.propagate = False

    def create_loaddata_log(self, job_path):
        """Cria um arquivo de log no diretório execução do Job.
        Este log é uma cópia do log definido no settings.
        Neste log estão as informações sobre a importaçao dos dados no banco de dados.
        Arguments:
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']
        """
        # Adiciona um Log Handle para fazer uma copia do log no diretório do processo.
        fh = logging.FileHandler(os.path.join(job_path, "skybot_loaddata.log"))
        formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
        fh.setFormatter(formatter)
        self.logger_import.addHandler(fh)
        self.logger.setLevel(settings.LOGGING_LEVEL)
        self.logger.propagate = False

    def get_base_path(self):
        """Retorna o diretório onde estão todos os jobs do skybot.
        este diretório está expecificado na settings.SKYBOT_OUTPUT

        Returns:
            str -- Path onde ficam os resultados de todos os jobs skybot.
        """
        return self.base_path

    def get_job_path(self, job_id):
        """Retorna o path para o Job baseado em seu id.
        o diretório de um job é composto por base_path/des_skybot_<job_id>

        Arguments:
            job_id {int} -- Id do Job que está sendo executado

        Returns:
            str -- Path onde o job está sendo executado.
        """

        output_path = os.path.join(self.get_base_path(), "des_skybot_%s" % str(job_id))
        return output_path

    def create_job_dir(self, job_id):
        """Cria o Diretório para o job se não existir.

        Arguments:
            job_id {int} -- Id do Job que está sendo executado

        Returns:
            job_path {str} -- Path onde o job está sendo executado.
        """

        path = self.get_job_path(job_id)
        if not os.path.exists(path):
            os.mkdir(path)
            self.logger.info("A directory has been created for the job.")

        return path

    def get_positions_path(self, job_id):
        """Retorna o path onde os arquivos de resultado do skybot vão ficar no final da execução.
        Durante a execução os arquivos ficam no job_path, mas depois de importados ficam neste diretório.
        Arguments:
            job_id {int} -- Id do Job que está sendo executado

        Returns:
            str -- O diretório de outputs é o job_path/outputs.
        """
        return os.path.join(self.get_job_path(job_id), "outputs")

    def create_positions_path(self, job_id):
        """Cria um diretório de outputs se não existir.

        Arguments:
            job_id {int} -- Id do Job que está sendo executado

        Returns:
            str -- O diretório de outputs é o job_path/outputs.
        """
        path = self.get_positions_path(job_id)
        if not os.path.exists(path):
            os.mkdir(path)
            self.logger.info("A directory has been created for the Outputs.")

        return path

    def delete_job_dir(self, job_id):
        """Apaga um diretório de Job com todo seu conteudo.

        Arguments:
            job_id {int} -- Id do Job que sera apagado.
        """
        path = self.get_job_path(job_id)
        if os.path.exists(path) and os.path.isdir(path):
            shutil.rmtree(path)
            self.logger.debug("Job directory has been deleted.")

    def delete_positions_dir(self, job_id):
        """Apaga o diretório de posições de um job com todo seu conteudo.

        Arguments:
            job_id {int} -- Id do Job que sera apagado.
        """
        path = self.get_positions_path(job_id)
        if os.path.exists(path) and os.path.isdir(path):
            shutil.rmtree(path)
            self.logger_import.info(
                "Job Outputs directory has been deleted. [%s]" % path
            )

    def estimate_execution_time(self, exposures):

        try:
            se = self.dsdao.skybot_estimate()
            average_time = se["t_exec_time"] / int(se["total"])
            estimated_time = (int(exposures) * average_time).total_seconds()

        except:
            # Caso não tenha dados para a estimativa utilizar 2.15 segundos para cada exposição.
            estimated_time = int(exposures) * 2.15

        return timedelta(seconds=estimated_time)

    def query_exposures_by_period(self, start, end):
        """Retorna todas as Des/Exposures que tenham date_obs entre o periodo start, end.

        23/06/2020 - Foi modificada a query para retornar somente as exposições que ainda não foram executadas.

        Arguments:
            start {date} -- Data Inicial do periodo
            end {date} -- Data Final do periodo

        Returns:
            Array -- Array com as exposições que atendem ao periodo. cada exposição tem o mesmo conteudo do model des.Exposures
        """

        #  Esta query retorna todas as exposições independente de terem sido executadas ou não
        # rows = self.epdao.exposures_by_period(start, end)

        # Esta query retorna todas as exposições que ainda não foram executadas pelo skybot
        rows = self.dsdao.not_exec_by_period(start, end)

        self.logger.info("[%s] Exposures for the period were found." % len(rows))
        return rows

    def get_exposures_filepath(self, job_path):
        """Retorna o filepath para o arquivo csv que guarda as informações das exposições.

        Arguments:
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']

        Returns:
            str -- filepath para exposures.csv, é a junção de job_path/exposures.csv
        """
        filepath = os.path.join(job_path, "exposures.csv")
        return filepath

    def get_exposures(self, job_id, start, end):
        """Retorna todas as exposições para um job, executa a query uma unica vez e guarda o resultado
        no arquivo exposures.csv. se o arquivo exisitir não executa a query novamente.

        Arguments:
            job_id {int} -- Id do Job que está sendo executado.
            start {date} -- Data Inicial do periodo
            end {date} -- Data Final do periodo

        Returns:
            pandas.Dataframe -- Retorna um dataframe com as exposições.
        """

        # Verifica se já existe um arquivo com as exposições criado.
        job_path = self.get_job_path(job_id)
        filepath = self.get_exposures_filepath(job_path)
        if not os.path.exists(filepath):
            # Se não existir faz a query, cria um pandas dataframe e salva em arquivo.

            # Executa a query para saber todas as exposições para este periodo.
            rows = self.query_exposures_by_period(
                start.strftime("%Y-%m-%d 00:00:00"), end.strftime("%Y-%m-%d 23:59:59")
            )

            # Cria um pandas dataframe com as exposições.
            df = self.create_exposure_dataframe(rows, job_path)

        else:
            # Se existir le o arquivo e retorna o pandas dataframe.
            df = self.read_exposure_dataframe(job_path)

        return df

    def apply_corection_in_date_obs(self, date_obs, exptime):
        """Aplica uma correção a data de observação das exposições
        esta correção é :
        date_obs = date_obs + (exptime + correction)/2
        no caso da DECam o valor de correction é: 1.05

        Args:
            date_obs (datetime): Data de observação da exposição no formato iso: '2012-11-10 04:09:45.855327+00:00'
            exptime (float): Temnpo  da exposição, atributo exptime da tabela des/exposure

        Returns:
            datetime: Data de observação mais o valor da correção.
        """
        date = dateutil.parser.parse(str(date_obs))

        correction = (float(exptime + float(self.date_correction))) / 2

        date = date + timedelta(seconds=correction)

        return date

    def create_exposure_dataframe(self, rows, job_path):
        """Cria um dataframe para as exposições.

        Arguments:
            rows {Array} -- Uma lista de exposições
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']

        Returns:
            pandas.Dataframe -- Retorna um dataframe com as exposições.
        """

        filepath = self.get_exposures_filepath(job_path)

        df = pd.DataFrame(
            rows, columns=["id", "date_obs", "radeg", "decdeg", "exptime"]
        )

        # 20-07-2020 Martin solicitou que fosse aplicado uma correção ao campo date_obs.
        # date_obs = date_obs + (exptime + correction)/2
        # onde correction para DECam é 1.05
        df["date_with_correction"] = ""
        if df.shape[0] > 0:
            df["date_with_correction"] = df.apply(
                lambda row: self.apply_corection_in_date_obs(
                    row["date_obs"], row["exptime"]
                ),
                axis=1,
            )

        # Adicionar os campos que serão enviados para o Skybot
        df["radius"] = self.radius

        df["observer_location"] = self.observer_location

        df["position_error"] = self.position_error

        # Escreve o dataframe em arquivo.
        df.to_csv(filepath, sep=";", header=True, index=False)

        self.logger.info("An archive was created with the Exposures.")
        self.logger.debug("Exposures File: [%s]" % filepath)

        return df

    def read_exposure_dataframe(self, job_path):
        """Retorna o conteudo do dataframe de exposições.

        Arguments:
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']

        Returns:
            pandas.Dataframe -- Retorna um dataframe com as exposições.
        """
        filepath = self.get_exposures_filepath(job_path)

        df = pd.read_csv(filepath, delimiter=";")

        return df

    def get_request_dataframe_filepath(self, job_path):
        """Retorna o filepath do arquivo requests.csv

        Arguments:
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']

        Returns:
            str -- Filepath for job_path/requests.csv
        """
        filepath = os.path.join(job_path, "requests.csv")
        return filepath

    def create_request_dataframe(self, rows, job_path):
        """Cria um dataframe com os dados das requisições feitas ao skybot.
        cada linha representa uma exposição.

        Arguments:
            rows {Array} -- Uma lista de exposições e os dados da requisição ao skybot.
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']

        Returns:
            pandas.Dataframe -- Retorna um dataframe com as requisições..
        """
        filepath = self.get_request_dataframe_filepath(job_path)

        df = pd.DataFrame(
            rows,
            columns=[
                "exposure",
                "success",
                "ticket",
                "positions",
                "start",
                "finish",
                "execution_time",
                "output",
                "filename",
                "file_size",
                "skybot_url",
                "error",
            ],
        )

        df = df.fillna(0)
        df["ticket"] = df.ticket.astype("int64")

        # Escreve o dataframe em arquivo.
        df.to_csv(filepath, sep=";", header=True, index=False)

        self.logger.info("An archive was created with the Skybot Requests.")
        self.logger.debug("Requests File: [%s]" % filepath)

        return df

    def read_request_dataframe(self, job_path, usecols=None):
        """Retorna o conteudo do dataframe de requisições.

        Arguments:
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']

        Keyword Arguments:
            usecols {Array} -- Lista de colunas que serão retornadas, None retorn todas. (default: {None})

        Returns:
            pandas.Dataframe -- Retorna um dataframe com as requisições.
        """
        filepath = self.get_request_dataframe_filepath(job_path)

        df = pd.read_csv(
            filepath,
            delimiter=";",
            usecols=usecols,
            dtype={
                "ticket": "int64",
                "positions": "int32",
            },
        )

        return df

    def check_status(self, job_id):

        job = self.get_job_by_id(job_id)
        filepath = os.path.join(job["path"], "status.json")

        if job["status"] == 4:
            raise Exception("The job has failed.")

        if os.path.exists(filepath):

            status = None
            try:
                with open(filepath) as json_file:
                    status = json.load(json_file)

            except Exception as e:
                trace = traceback.format_exc()
                self.logger.error(trace)
                self.logger.error(e)
                # Pode acontecer de tentar ler o arquivo no mesmo momento em que ele está sendo criado.
                return

            if status is not None and status["status"] == "aborted":
                msg = "The job was aborted."
                if "reason" in status:
                    msg = status["reason"]

                # Lanca uma exeção para abortar o job.
                raise AbortSkybotJobError(msg)

            # TODO: Aducionar a opção de Pausar o Job

    def write_status_json(self, job_id, status, reason):
        job = self.get_job_by_id(job_id)
        filepath = os.path.join(job["path"], "status.json")

        data = dict({"status": str(status), "reason": str(reason)})

        with open(filepath, "w") as f:
            json.dump(data, f)

    def run_skybot_by_exposure(self, skybot_server_url, job_path, exp, attempt=1):
        # Instancia da classe SkybotServer para fazer as requisições.
        # A url para o serviço do skybot fica na settings.SKYBOT_SERVER
        ss = SkybotServer(url=skybot_server_url)

        # caminho para o arquivo com os resultados retornados pelo skyubot.
        filename = "%s.temp" % exp["id"]
        output = os.path.join(job_path, filename)

        # Executa o consulta usando a função cone_search.
        result = ss.cone_search(
            date=exp["date_with_correction"],
            ra=exp["radeg"],
            dec=exp["decdeg"],
            radius=exp["radius"],
            observer_location=exp["observer_location"],
            position_error=exp["position_error"],
            output=output,
        )

        # Adiciona o id da exposição ao resultado.
        result.update({"exposure": exp["id"]})

        # Se o resultado tiver gerado algum arquivo
        if result["file_size"] > 0:
            # o Nome do arquivo agora é composto por exposure_id + ticket.
            # e a extensão passa a ser .csv, mudando o nome do arquivo depois que ele
            # já foi escrito eu garanto que ele está pronto para ser importado.

            filename = "%s_%s.csv" % (exp["id"], result["ticket"])
            if not result["success"]:
                # Se tiver gerado algum arquivo mas o resultado está com falha o arquivo é renomeado com a extensão '.err'
                filename += ".err"

            filepath = os.path.join(job_path, filename)

            try:
                self.logger.debug("Output: [%s], Filepath: [%s]" % (output, filepath))

                # renomea o arquivo
                os.rename(output, filepath)
            except:
                result.update({"success": False, "error": "Unable to create file"})

            # guarda o novo filepath e filename
            result.update({"output": filepath, "filename": filename})
        else:
            result.update({"success": False, "error": "File has size equal to 0"})

        if result["success"] == True:
            self.logger.info(
                "Exposure [%s] returned [%s] positions in %s."
                % (
                    result["exposure"],
                    result["positions"],
                    humanize.naturaldelta(
                        timedelta(seconds=result["execution_time"]),
                        minimum_unit="milliseconds",
                    ),
                )
            )

            return result

        else:
            self.logger.warning(
                "Exposure [%s]: %s" % (result["exposure"], result["error"])
            )

            # If the exposure returned an error, try again for at least 10 times:
            if attempt <= 10:
                self.logger.warning("Attempts On Fail: %s of 10" % (attempt))

                # Increment the attempts variable by each recursion:
                attempt += 1
                # Call itself:
                return self.run_skybot_by_exposure(
                    skybot_server_url, job_path, exp, attempt
                )
            else:
                self.logger.warning(
                    "Exposure [%s]: Tried 10 times and failed every time."
                    % (result["exposure"])
                )
                return result

    def run_job(self, job_id):
        """Este método executa as etapas de request ao skybot.
        é executado em um unico loop, itera sobre todas as exposições
        e faz a requisição no serviço do skybot,

        Arguments:
            job_id {int} -- Id do Job que está sendo executado.
        """
        try:
            t0 = datetime.now()

            job = self.get_job_by_id(job_id)

            # Altera o Status do Job para Running
            job["status"] = 2
            job["start"] = datetime.now(timezone.utc)

            self.update_job(job)

            self.logger.debug("Alterando status do job para running")

            # Coleta Estatisticas do Volume de dados a ser executado no Job.
            start = datetime.strptime(str(job["date_initial"]), "%Y-%m-%d").strftime(
                "%Y-%m-%d 00:00:00"
            )
            end = datetime.strptime(str(job["date_final"]), "%Y-%m-%d").strftime(
                "%Y-%m-%d 23:59:59"
            )

            # Total de exposures não executadas no Periodo.
            job["exposures"] = self.dsdao.count_not_exec_by_period(start, end)

            # Recuperar o total de noites com exposição não executadas no periodo
            job["nights"] = self.epdao.count_not_exec_nights_by_period(start, end)

            # Recuperar o total de ccds não executados no periodo.
            job["ccds"] = self.ccddao.count_not_exec_ccds_by_period(start, end)

            # Estimativa de tempo baseada na qtd de exposures a serem executadas.
            job["estimated_execution_time"] = self.estimate_execution_time(
                job["exposures"]
            )

            # Cria o diretório onde o job será executado e onde ficaram os outputs.
            job_path = self.create_job_dir(job_id)
            job["path"] = job_path
            self.logger.debug("Job Path: [%s]" % job_path)

            positions_path = self.create_positions_path(job_id)
            self.logger.debug("Positions Path: [%s]" % positions_path)

            # File path para o arquivo de resultados.
            results_filepath = os.path.join(job["path"], "results.csv")
            job["results"] = results_filepath
            # Adiciona um Log handler a mais, duplicando o log no diretório do processo.
            # ATENÇÂO: Os handles de logs devem ser criados no inicio do job em uma fase que não se repita.
            self.create_skybot_log(job["path"])
            self.create_loaddata_log(job["path"])

            self.logger.info("".ljust(50, "-"))
            self.logger.info("Stating DES Skybot Job ID: [%s]" % job["id"])
            self.logger.info(
                "Period Start: [%s] End: [%s]"
                % (job["date_initial"], job["date_final"])
            )

            # Criar um dataframe com as exposições a serem executadas.
            # este dataframe vai guardar também as estatisticas de cada execução.
            self.logger.info("Creating the list of exposures to be processed.")
            df_exposures = self.get_exposures(
                job_id, job["date_initial"], job["date_final"]
            )

            self.update_job(job)

            # Notify User Start Proccess
            self.notify_start_job(job_id)

            # Aqui inicia as requisições para o serviço do Skybot.
            # Para cada exposição faz a requisição no serviço do Skybot.

            # Array com os resultados de cada requisição
            requests = list([])

            # Total de exposures que serão analizadas neste Job.
            t_exposures = df_exposures.shape[0]

            # Lista de exposições que serão executadas.
            a_exposures = df_exposures.to_dict(
                "records",
            )
            # # ------- REMOVER ---------
            # a_exposures = df_exposures.to_dict(
            #     "records",
            # )[0:5]

            # Guarda o total de tempo de execução para calcular o tempo médio.
            t_exec_time = []

            # Arquivo onde sera gravados o andamento da execução.
            heartbeat = self.get_request_heartbeat_filename(job_path)

            t_requests = 0
            t_success = 0
            t_failure = 0

            # Caso não tenha nenhum exposição para executar
            if len(a_exposures) == 0:

                # Cria o arquivo de Heartbeat
                self.update_request_heartbeat(heartbeat, "completed", 0, 0, 0, 0, 0)

                # Criar um dataframe para guardar as estatisticas de cada requisição.
                df_requests = self.create_request_dataframe([], job_path)

            else:
                # Cria o arquivo de Heartbeat
                self.update_request_heartbeat(
                    heartbeat, "running", 0, len(a_exposures), 0, 0, 0
                )

                # Criar o arquivo de Heartbeat para o Load Skybot Data tb para evitar errors
                self.update_loaddata_heartbeat(
                    self.get_loadata_heartbeat_filepath(job_path),
                    "running",
                    0,
                    0,
                    0,
                    0,
                )

                self.logger.info("Skybot Server: [%s]" % settings.SKYBOT_SERVER)

                for idx, exp in enumerate(a_exposures, start=1):

                    # Antes de fazer o download, verifica qual o status do job
                    # se ele não foi Abortado ou Pausado.
                    self.check_status(job_id)

                    # Função de rodar as exposures
                    # Em caso de erro executa novamente até o limite de 10 tentativas
                    result = self.run_skybot_by_exposure(
                        settings.SKYBOT_SERVER, job_path, exp
                    )
                    # self.logger.debug(result)

                    if result["success"]:
                        t_success += 1
                    else:
                        t_failure += 1

                    # guarda o resultado do dataframe de requisições.
                    requests.append(result)

                    # Incremeta o tempo total de execução.
                    t_exec_time.append(result["execution_time"])

                    # Atualiza o arquivo de heartbeat
                    self.update_request_heartbeat(
                        heartbeat,
                        "running",
                        idx,
                        len(a_exposures),
                        mean(t_exec_time or [0]),
                        t_success,
                        t_failure,
                    )

                # Criar um dataframe para guardar as estatisticas de cada requisição.
                df_requests = self.create_request_dataframe(requests, job_path)

                # Totais de sucesso e falha.
                t_requests = df_requests.shape[0]

                # Quando termina de baixar todas as exposições atualiza o heartbeat com status done
                self.update_request_heartbeat(
                    heartbeat,
                    "completed",
                    idx,
                    len(a_exposures),
                    mean(t_exec_time or [0]),
                    t_success,
                    t_failure,
                )

            # tempo de execução
            t1 = datetime.now()
            tdelta = t1 - t0

            self.logger.info(
                " [%s] Exposures,  [%s] Requests, [%s] Success and [%s] Failure:  in %s"
                % (
                    t_exposures,
                    t_requests,
                    t_success,
                    t_failure,
                    humanize.naturaldelta(tdelta, minimum_unit="seconds"),
                )
            )

            # raise Exception("Parou AQUI!!!!")

        except AbortSkybotJobError as e:

            # Atualiza o arquivo de heartbeat com o status aborted.
            request_heartbeat = self.read_request_heartbeat(job_path)
            self.update_request_heartbeat(
                heartbeat,
                "aborted",
                request_heartbeat["current"],
                request_heartbeat["exposures"],
                request_heartbeat["average_time"],
                request_heartbeat["exposures_success"],
                request_heartbeat["exposures_failed"],
            )

            # Criar um dataframe para guardar as estatisticas de cada requisição.
            df_requests = self.create_request_dataframe(requests, job_path)

            # Vai parar de fazer as requisições mais ainda vai continuar executando o load data.
            # O load data fica responsavel por finalizar o job e guardar os resultados.

        except ValueError as e:
            trace = traceback.format_exc()
            self.logger.error(trace)
            self.logger.error(e)

        except Exception as e:
            trace = traceback.format_exc()
            self.logger.error(trace)
            self.logger.error(e)

            self.on_error(job_id, e)

    def get_request_heartbeat_filename(self, job_path):
        """Retorna o filepath para o arquivo request_heartbeat.

        Arguments:
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']

        Returns:
            str -- job['path']/request_heartbeat.json
        """
        return os.path.join(job_path, "request_heartbeat.json")

    def update_request_heartbeat(
        self, filepath, status, current, total, average, success=0, failed=0
    ):
        """Atualiza o arquivo heartbeat com a situação atual do Job na etapa de request.

        Arguments:
            filepath {str} -- Path retornado pelo metodo get_request_heartbeat_filename
            status {str} -- running or completed
            current {int} -- Indice da exposição que esta sendo executada no momento
            total {int} -- Total de exposições a serem executadas
            average {float} -- tempo médio de execução por exposição.
        """
        #  Calcaula o tempo estimado para as exposições que ainda faltam baixar.
        estimate = (total - current) * average
        if status == "aborted":
            estimate = 0

        data = dict(
            {
                "status": str(status),
                "exposures": int(total),
                "current": int(current),
                "average_time": float(average),
                "time_estimate": float(estimate),
                "exposures_success": int(success),
                "exposures_failed": int(failed),
                "last_state": {
                    "current": int(current),
                    "time": datetime.now().isoformat(),
                },
            }
        )

        with open(filepath, "w") as f:
            json.dump(data, f)

    def read_request_heartbeat(self, job_path):
        """Le o arquivo request heartbeat e retorna um dict com seu conteudo.

        Arguments:
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']

        Returns:
            dict -- Dicionario com as informações parcias sobre o andamento desta etapa.
                {
                    'status':  str,            Status deste componente no momento. exemplo running, complete
                    'exposures': int,          Quantidade de exposures que serão executadas.
                    'current': int,            Quantidade de exposures que já foram executadas exemplo: current/exposures executou 1/10
                    'average_time': float,     Tempo médio de execução para cada exposure.
                    'time_estimate':  float    Estimativa para conclir está etapa para todas as exposures.
                }
        """
        filepath = self.get_request_heartbeat_filename(job_path)
        with open(filepath) as f:
            return json.load(f)

    def reset_job_for_test(self, job_id):
        """Volta o Job para o estado inicial,
        util apenas para testes. durante o desenvolvimento
        Arguments:
            job_id {int} -- Id do Job que sera apagado.
        """
        self.logger.info("Resetando o Job para Iniciar o teste")

        # job = SkybotJob.objects.get(pk=job_id)
        job = self.get_job_by_id(job_id)

        # Exclui o diretório do job.
        self.delete_job_dir(job_id)

        job["status"] = 1
        job["error"] = None
        job["start"] = datetime.now(timezone.utc)
        job["finish"] = None
        job["execution_time"] = None
        job["path"] = ""
        job["exposures"] = 0

        self.update_job(job)

        self.logger.info("Job Resetado")

    def check_request_queue(self):
        """Verifica a fila de jobs, se tiver algum job com status idle.
        inicia a execução do job.
        ATENÇÂO: Este metodo está associado a Daemon, ele é executado de tempos em tempos.
        segundo definido no arquivo skybot/daemon.

        """
        # Verificar se já existe algum job com status Running.
        running = self.spdao.get_by_status(2)
        # self.logger.info("Checando a Fila: Running [%s]" % len(running))

        if len(running) == 0:
            # Se nao tiver nenhum job executando verifica se tem jobs com status Idle
            # esperando para serem executados.
            # idle =  SkybotJob.objects.filter(status=1)
            idle = self.spdao.get_by_status(1)
            if len(idle) > 0:
                self.logger.info("There are %s jobs waiting to run" % len(idle))

                to_run = idle[0]
                self.logger.info("Starting the job with id %s" % to_run["id"])

                self.run_job(to_run["id"])

    def check_loaddata_queue(self):
        """Verifica se a fila de jobs, se tiver algum job com status running.
        Inicia a execução do componente loaddata. está função é executada pela daemon.
        executa de tempo em tempo.
        ATENÇÃO: Ter em mente que este metodo pode estar sendo executado ao mesmo
        tempo que o metodo check_request_queue. os 2 são assincronos e executam juntos.
        """

        # Verifica se já existe algum job com status Running.
        a_running = self.spdao.get_by_status(2)

        # Se tiver algum job executando, verifica se tem arquivos
        # a serem importados no banco de dados.
        if len(a_running) > 0:
            # self.logger_import.info("Tem um job executando.")
            running = a_running[0]
            if self.check_lock_load_data(running["path"]):
                # Se não exisitir arquivo de lock
                # significa que não tem nenhum importação acontecendo
                self.run_import_positions(running["id"])

    def check_lock_load_data(self, job_path):
        """Verifica se existe um arquivo de lock para as tasks de load data.
        Se exisir retorna False, se não existir cria o arquivo de lock e retorna True.

        Arquivo de lock tem a função de prevenir que 2 operações de importação
        no banco de dados ocorram ao mesmo tempo.

        True nesta função significa que o job pode ser executado.

        Arguments:
            job_path {string} -- Diretório onde o job esta sendo executado.

        Returns:
            Bool -- True se o lock não existir e False se existir.
        """
        #
        filepath = os.path.join(job_path, "load_data.lock")
        if os.path.exists(filepath):
            return False
        else:
            # Cria um arquivo de Lock caso não exista
            open(filepath, "x").close()
            self.logger_import.debug("Lock file created.")
            return True

    def get_files_to_import(self, job_path):
        """Varre o diretório do Job procurando arquivos .csv com os outputs do componente request.
        Retorna uma lista com o filepath desses arquivos.
        Também leva em conta alguns arquivos csv que são ignorados por não serem outputs.

        Arguments:
            job_path {str} -- Path onde o job está sendo executado.

        Returns:
            Array -- Retorna um Array com os arquivos de output do request. que estão no job_path.
        """

        # Lista de arquivos csv que podem estar no mesmo diretório mais que não são outputs do skybot.
        ignore_list = ["exposures.csv", "requests.csv", "loaddata.csv"]

        a_files = []
        for f in pathlib.Path(job_path).glob("*.csv"):
            if f.name not in ignore_list:
                a_files.append(f)

        return a_files

    def run_import_positions(self, job_id):
        """Este metodo executa a etapa de importação de dados.
        é executada pela daemon de tempos em tempos. varre o diretório do job
        e caso tenha arquivos de output no diretório do job executa a importação
        para cada arquivo. conforme vai importando vai atualizando os arquivos de resultado.
        cada arquivo imporado é movido para a pasta de outputs. se der erro na importação
        o arquivo é renomeado com a extensão .err

        Arguments:
            job_id {int} -- Id do Job que está sendo executado.
        """

        t0 = datetime.now()

        # Recupera o Model pelo ID
        try:
            job = self.get_job_by_id(job_id)

        except Exception as e:
            trace = traceback.format_exc()
            self.logger.error(trace)
            self.logger_import.error(e)
            raise (e)

        # Diretório onde vão ficar os arquivos de posição que foram importados corretamente.
        positions_path = self.get_positions_path(job_id)

        try:
            self.logger_import.debug("----------------------------------------------")

            # Total a ser executado ler do heartbead da etapa anterior
            try:
                # Na primeira execução pode ocorrer ao mesmo tempo que o componente requests.
                # e o arquivo heartbeat pode ainda não ter sido criado.
                # o valor do execute vai estar errado, mas é corrigido na segunda execução.
                loaddata_heartbeat = self.read_loaddata_heartbeat(job["path"])
                t_success = loaddata_heartbeat["exposures_success"]
                t_failure = loaddata_heartbeat["exposures_failed"]
                t_executed = loaddata_heartbeat["current"]

            except FileNotFoundError:
                t_executed = 0
                t_success = 0
                t_failure = 0

            try:
                # le o heartbead da etapa anterior
                request_heartbeat = self.read_request_heartbeat(job["path"])

                # Total a ser executado  (Total de exposições menos as que falharam na etapa do request.)
                t_to_execute = (
                    request_heartbeat["exposures"]
                    - request_heartbeat["exposures_failed"]
                )
                request_heartbeat_exists = True

            except (FileNotFoundError, json.decoder.JSONDecodeError) as e:
                request_heartbeat_exists = False
                trace = traceback.format_exc()
                self.logger_import.debug("File not found or JSONDecodeError")
                self.logger_import.error(trace)
                self.logger_import.error(e)
                return

            #  Arquivo que controla o andamento do job.
            heartbeat = self.get_loadata_heartbeat_filepath(job["path"])

            # Ler o dataframe
            df_filepath = self.get_loaddata_dataframe_filepath(job["path"])

            if t_to_execute == 0:
                t_success = 0
                t_failure = 0
                t_files = 0

                # Atualiza o Heartbeat do loaddata.
                if request_heartbeat_exists:
                    self.update_loaddata_heartbeat(
                        heartbeat,
                        "completed",
                        0,
                        0,
                        0,
                        0,
                    )
                else:
                    # Atualiza o Heartbeat do loaddata.
                    self.update_loaddata_heartbeat(
                        heartbeat,
                        "running",
                        0,
                        0,
                        0,
                        0,
                    )

                df_loaddata = self.update_loaddata_dataframe([], df_filepath)

            else:

                # Instancia da Classe de Importação.
                loaddata = DESImportSkybotPositions()

                # Varre o diretório, lista todos os arquivos de posições
                # gerados pelo skybot.
                # para cada arquivo executa o metodo de importação.
                results = list([])

                # Esta funcao get_files poderia ser um unico loop,
                # escolhi fazer separado, para ter acesso ao total de arquivos no inicio da iteração.
                # este array a_files já ignora os outros arquivos csv no diretório.
                a_files = self.get_files_to_import(job["path"])
                to_import = len(a_files)

                self.logger_import.debug(
                    "Number of files to be imported [%s]." % to_import
                )

                try:
                    # Ler o Dataframe loaddata para saber quantas já foram executaas.
                    # Na primeira execução o arquivo não existe por isso este bloco entre try/except.
                    df_loaddata = self.read_loaddata_dataframe(df_filepath)

                    # Total de exposição que já foram importadas.
                    # t_executed = int(df_loaddata.success.count())

                    # Tempo total de execução das exposições já executadas.
                    t_exec_time = df_loaddata.execution_time.to_list()

                    # Total de CCDs já executados
                    t_ccds = int(df_loaddata.ccds.sum())

                except:
                    t_ccds = 0
                    t_exec_time = []

                # Para cada arquivo a ser importado executa o metodo de importação
                # guarda o resultado no dataframe e move o arquivo para o diretório de outputs.
                for idx, pos_file in enumerate(a_files, start=1):

                    # Nome do arquivo é composto por ExposureId_Ticket.csv
                    # Recupera o Exposure id
                    exposure_id = pos_file.name.split("_")[0].strip()
                    # Recupera o Ticket
                    ticket = pos_file.name.split("_")[1].split(".")[0].strip()

                    # Executa o Metódo de importação.
                    # result = loaddata.import_des_skybot_positions_q3c(
                    #     exposure_id, ticket, pos_file)
                    result = loaddata.import_des_skybot_positions(
                        exposure_id, ticket, pos_file, job_id
                    )

                    # Mover os arquivos para diretório de outputs.
                    if result["success"]:
                        t_success += 1

                        # Em caso de sucesso o nome do arquivo permanece o mesmo.
                        new_filepath = os.path.join(positions_path, pos_file.name)
                    else:
                        t_failure += 1
                        # Em caso de falha o arquivo recebe a extensão .err
                        new_filepath = os.path.join(
                            positions_path, pos_file.name.replace(".csv", ".err")
                        )

                    # Move para o diretório de outputs
                    shutil.move(pos_file, new_filepath)

                    self.logger_import.debug("File moved to: [%s]" % new_filepath)

                    result.update({"output": str(new_filepath)})

                    results.append(result)

                    self.logger_import.debug(
                        "Exposure: [%s] Success: [%s] Filepath: [%s]"
                        % (
                            str(exposure_id),
                            str(result["success"]),
                            str(result["output"]),
                        )
                    )

                    # Incrementa os totais.
                    t_executed += 1
                    t_exec_time.append(result["execution_time"])
                    t_ccds += result["ccds"]

                    # Atualiza o Heartbeat do loaddata.
                    self.update_loaddata_heartbeat(
                        heartbeat,
                        "running",
                        t_executed,
                        t_to_execute,
                        mean(t_exec_time or [0]),
                        t_ccds,
                        t_success,
                        t_failure,
                    )

                # Totais de sucesso e falha.
                t_files = len(results)

                if t_executed == t_to_execute:
                    self.update_loaddata_heartbeat(
                        heartbeat,
                        "completed",
                        t_executed,
                        t_to_execute,
                        mean(t_exec_time or [0]),
                        t_ccds,
                        t_success,
                        t_failure,
                    )

                df_loaddata = self.update_loaddata_dataframe(results, df_filepath)

            # tempo de execução
            t1 = datetime.now()
            tdelta = t1 - t0

            self.logger_import.debug(
                "Total files to be imported: [%s] Success: [%s] Failure: [%s] in %s"
                % (
                    str(t_files),
                    str(t_success),
                    str(t_failure),
                    str(humanize.naturaldelta(tdelta, minimum_unit="seconds")),
                )
            )

            # Verificar se status do Job
            self.check_status(job_id)

            # Verificar quando o Processo efetivamente acabou.
            self.consolidate(job_id)

        except AbortSkybotJobError as e:
            loaddata_heartbeat = self.read_loaddata_heartbeat(job["path"])
            self.update_loaddata_heartbeat(
                heartbeat,
                "aborted",
                loaddata_heartbeat["current"],
                loaddata_heartbeat["exposures"],
                loaddata_heartbeat["average_time"],
                loaddata_heartbeat["executed_ccds"],
                loaddata_heartbeat["exposures_success"],
                loaddata_heartbeat["exposures_failed"],
            )

            # Verificar quando o Processo efetivamente acabou.
            # Consolida o Job
            self.consolidate(job_id, aborted=True)

            # Vai parar de fazer as importações e vai registrar o termino do job
            self.logger_import.warning(str(e))
            self.on_abort(job_id, str(e))

        except IndexError:
            self.logger_import.info("No files to import.")
            # Verificar se o job acabou
            self.consolidate(job_id)

        except Exception as e:
            trace = traceback.format_exc()
            self.logger_import.error(trace)
            self.logger_import.error(e)

            self.on_error(job_id, e)

        finally:
            # Apagar o arquivo de lock
            filepath = os.path.join(job["path"], "load_data.lock")
            os.remove(filepath)
            self.logger_import.debug("Lock file removed.")

    def get_loaddata_dataframe_filepath(self, job_path):
        """Retorna o filepath para o dataframe que contem os resultados da etapa de loaddata.

        Arguments:
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']

        Returns:
            str -- Filepath for job_path/loaddata.csv
        """
        filepath = os.path.join(job_path, "loaddata.csv")
        return filepath

    def update_loaddata_dataframe(self, rows, filepath):
        """Cria ou atualiza o dataframe com os resultados da etapa de loaddata.
        se o arquivo loaddata.csv não existir ele é criado.
        se existir é  lido seu conteudo, adicionado as novas rows e retorna o dataframe.
        Arguments:
            rows {Array} -- Resultados do loaddata uma linha para cada exposição.
            filepath {str} -- Filepath retornado pelo metodo get_loaddata_dataframe_filepath

        Returns:
            pandas.Dataframe -- Dataframe com os resultados da etapa loaddata.
        """
        columns = [
            "exposure",
            "success",
            "ticket",
            "positions",
            "ccds",
            "ccds_with_asteroids",
            "inside_ccd",
            "outside_ccd",
            "output",
            "start",
            "finish",
            "execution_time",
            "import_pos_exec_time",
            "ccd_assoc_exec_time",
            "error",
            "tracebak",
        ]

        if not os.path.exists(filepath):
            # Cria um Dataframe com os dados da importação.
            df = pd.DataFrame(rows, columns=columns)
            # Escreve o dataframe em arquivo.
            df.to_csv(filepath, sep=";", header=True, index=False)

            self.logger_import.info(
                "An archive was created with the Load Data Statistics."
            )
            self.logger_import.debug("Load Data File: [%s]" % filepath)

            return df
        else:
            #  Se o dataframe já existir le o conteudo do csv.
            df = self.read_loaddata_dataframe(filepath)

            # Inclui as novas linhas.
            # df = df.append(pd.DataFrame(rows, columns=columns), ignore_index=True)
            df = pd.concat([df, pd.DataFrame(rows, columns=columns)], ignore_index=True)

            # Seobrescreve o arquivo csv.
            df.to_csv(filepath, sep=";", header=True, index=False)

            self.logger_import.debug(
                "Import data has been updated in the Load Data file."
            )

            return df

    def read_loaddata_dataframe(self, filepath, usecols=None):
        """Le o arquivo csv com os dados da execução do componente loaddata,
        Retorna um pandas dataframe.

        Arguments:
            filepath {str} -- Filepath para o arquivo csv com os resultados do loaddata.

        Returns:
            Pandas.DataFrame -- Retorna um dataframe om os resultados do loaddata.
        """
        df = pd.read_csv(
            filepath,
            sep=";",
            usecols=usecols,
            dtype={
                "ticket": "int64",
                "positions": "int32",
                "ccds": "int32",
                "ccds_with_asteroids": "int32",
                "inside_ccd": "int32",
                "outside_ccd": "int32",
            },
        )
        return df

    def get_loadata_heartbeat_filepath(self, job_path):
        """Retorna o path para o arquivo heatbeat do componente loaddata.

        Arguments:
            job_path {str} -- Path onde o job está sendo executado.

        Returns:
            str -- Filepath para o arquivo heartbeat. job['path']/loaddata_heartbeat.json
        """
        return os.path.join(job_path, "loaddata_heartbeat.json")

    def update_loaddata_heartbeat(
        self, filepath, status, current, total, average, t_ccds=0, success=0, failed=0
    ):
        """Atualiza o arquivo de heatbeat da etapa loaddata.

        Arguments:
            filepath {str} -- filepath retornado pelo metodo get_loadata_heartbeat_filepath
            status {str} -- running ou completed.
            current {int} -- indice da exposição que está sendo executada no momento.
            total {int} -- Total de exposições a ser executado.
            average {float} -- tempo médio de execução da etapa loaddata para cada exposição.
        """
        #  Calcaula o tempo estimado para as exposições que ainda faltam baixar.
        estimate = (total - current) * average
        if status == "aborted":
            estimate = 0

        data = dict(
            {
                "status": str(status),
                "exposures": int(total),
                "current": int(current),
                "average_time": float(average),
                "time_estimate": float(estimate),
                "executed_ccds": int(t_ccds),
                "exposures_success": int(success),
                "exposures_failed": int(failed),
                "last_state": {
                    "current": int(current),
                    "time": datetime.now().isoformat(),
                },
            }
        )

        with open(filepath, "w") as f:
            json.dump(data, f)

    def read_loaddata_heartbeat(self, job_path):
        """Le o arquivo loaddata heartbeat e retorna um dict com seu conteudo.

        Arguments:
            job_path {str} -- Path onde o job está sendo executado. normalmente Model job['path']

        Returns:
            dict -- Dicionario com as informações parcias sobre o andamento desta etapa.
                {
                    'status':  str,            Status deste componente no momento. exemplo running, complete
                    'exposures': int,          Quantidade de exposures que serão executadas.
                    'current': int,            Quantidade de exposures que já foram executadas exemplo: current/exposures executou 1/10
                    'average_time': float,     Tempo médio de execução para cada exposure.
                    'time_estimate':  float    Estimativa para conclir está etapa para todas as exposures.
                }
        """
        filepath = self.get_loadata_heartbeat_filepath(job_path)
        with open(filepath) as f:
            return json.load(f)

    def check_exposure_status(self, row):
        if bool(row["request_success"]) is True and bool(
            row["loaddata_success"] is True
        ):
            return True
        else:
            return False

    def consolidate(self, job_id, aborted=False):
        """Faz a checagem para saber se o Job completou as 2 etapas.
        Verifica se todas as exposições do job passaram pelas 2 etapas.
        caso tenha acabado, cria um arquivo com os resultados e encerra o job.

        Le os 3 dataframes, exposures, requests e loaddata junta seus resultados usando o exposure id.

        Arguments:
            job_id {int} -- Id do job que está sendo executado.
        """
        # Recupera o Model pelo ID
        try:
            job = self.get_job_by_id(job_id)

            # Le os arquivos de heartbeat para checar se o Job acabaou.

            # Na primeira execução pode ocorrer ao mesmo tempo que o componente requests.
            # e o arquivo heartbeat pode ainda não ter sido criado.
            # o valor do execute vai estar errado, mas é corrigido na segunda execução.
            request_heartbeat = self.read_request_heartbeat(job["path"])

            loaddata_heartbeat = self.read_loaddata_heartbeat(job["path"])

            # Job Acaba se tiver executado todas as exposições ou se tiver sido abortado.
            # no caso de abortado é registrado todos os resultados até o momento.

            # Se ambos os componentes tiverem executado todas as exposições.
            if (
                request_heartbeat["current"] == request_heartbeat["exposures"]
                and loaddata_heartbeat["current"] == loaddata_heartbeat["exposures"]
                or aborted is True
            ):
                self.logger_import.info("Consolidating Job. Aborted [%s]" % aborted)
                # Consolidar os arquivos de estatisticas.

                # Le o dataframe de exposições.
                exposures = self.read_exposure_dataframe(job["path"])
                exposures = exposures.set_index("id")

                # Le o dataframe de requests, Configura a exposure_id como index.
                # adiciona o prefixo 'request_' as colunas deste dataframe..
                requests = self.read_request_dataframe(job["path"])
                requests = requests.set_index("exposure")
                requests = requests.add_prefix("request_")

                # Le o arquivo com os resultados da etapa loaddata.
                # Configura a exposure_id como index
                # Adiciona o prefixo 'loaddata_' as coluns deste dataframe
                loaddata = self.read_loaddata_dataframe(
                    self.get_loaddata_dataframe_filepath(job["path"])
                )
                loaddata = loaddata.set_index("exposure")
                loaddata = loaddata.add_prefix("loaddata_")

                # Faz um join exposures + requests usando o exposure como atributo para fazer o ON.
                df_results = exposures.join(requests)
                # Faz um join exposures/requests + loaddata usando o exposure como atributo para fazer o ON.
                df_results = df_results.join(loaddata)

                # Neste ponto df_results é um dataframe que contem todas as linhas
                # e colunas dos 3 dataframes. cada exposure tem todos os atributos
                # independente de ter valor.

                # Organiza as colunas renomeando alguns atributos.
                df_results = df_results.rename(
                    columns={
                        "request_ticket": "ticket",
                        "request_positions": "positions",
                        "request_filename": "filename",
                        "request_file_size": "file_size",
                        "request_skybot_url": "skybot_url",
                        "loaddata_ccds": "ccds",
                        "loaddata_ccds_with_asteroids": "ccds_with_asteroids",
                        "loaddata_inside_ccd": "inside_ccd",
                        "loaddata_outside_ccd": "outside_ccd",
                        "loaddata_output": "output",
                    }
                )

                # Remove algumas colunas desnecessárias
                df_results = df_results.drop(
                    ["request_output", "loaddata_ticket", "loaddata_positions"], axis=1
                )

                # Adiciona uma coluna success, esta coluna considera o status dos 2 componentes
                # para cada exposure, seu valor é True se a exposure for executada corretamente
                # nos 2 componentes, e False se tiver falhado em um deles.
                if not df_results.empty:
                    df_results["success"] = df_results.apply(
                        self.check_exposure_status, axis=1
                    )
                else:
                    df_results["success"] = True

                # Adiciona uma coluna com o tempo total de execução de cada exposure.
                # Somando o tempo de execução das 2 etapas.
                df_results["execution_time"] = (
                    df_results.request_execution_time
                    + df_results.loaddata_execution_time
                )

                # Escreve o resultado geral do Job no arquivo.
                results_filepath = job["results"]
                results = pd.DataFrame(df_results)
                results["ticket"] = results.ticket.fillna(0)
                results["ticket"] = results.ticket.astype("int64")

                results.to_csv(results_filepath, sep=";", header=True, index=True)

                self.logger_import.info("Results file created: [%s]" % results_filepath)

                self.logger_import.debug(
                    "Recording the results of each exposure in the database."
                )

                # Opitei por ler o arquivo csv recem criado, por que tive dificuldade
                # em usar o dataset result, deu problemas na coluna exposure que estava sendo usada como index.
                # le o arquivo results e cria um dataframe contendo só as colunas referente ao model Des/SkybotJobResult
                df = pd.read_csv(
                    results_filepath,
                    sep=";",
                    usecols=[
                        "id",
                        "ticket",
                        "request_error",
                        "success",
                        "execution_time",
                        "ccds_with_asteroids",
                        "positions",
                        "inside_ccd",
                        "outside_ccd",
                        "filename",
                    ],
                )

                # Se tiver sido aborted registra só as que tiveram sucesso.
                if aborted is True:
                    df = df[df["success"] == True]
                    df = pd.DataFrame(df)

                df = df.fillna(0)
                df = df.astype(
                    {
                        "ticket": "int64",
                        "ccds_with_asteroids": "int32",
                        "positions": "int32",
                        "inside_ccd": "int32",
                        "outside_ccd": "int32",
                    }
                )

                # Renomeia a coluna exposure para exposure_id
                df.rename(
                    columns={"id": "exposure_id", "request_error": "error"},
                    inplace=True,
                )

                # Adiciona uma coluna com o id do Des/SkybotJob
                df["job_id"] = int(job_id)
                # Muda a ordem das colunas para ficar igual a tabela des_skybotjobresutl
                df = df.reindex(
                    columns=[
                        "ticket",
                        "success",
                        "error",
                        "execution_time",
                        "positions",
                        "inside_ccd",
                        "outside_ccd",
                        "filename",
                        "exposure_id",
                        "job_id",
                        "ccds_with_asteroids",
                    ]
                )

                # Filtrar apenas pelas exposições com sucesso:
                df = df[df["success"] == True]

                # Importa o conteudo do dataframe para a tabela.
                imported = DesSkybotJobResultDao(pool=False).import_data(df)
                self.logger_import.debug("Rows Imported: %s" % imported)

                if aborted is True:
                    self.on_abort(job_id)
                else:

                    # Atualiza os totais do job
                    job["positions"] = self.dsdao.t_positions_des_by_job(job["id"])
                    job["asteroids"] = self.dsdao.t_unique_objects_by_job(job["id"])
                    job["exposures_with_asteroid"] = (
                        self.dsdao.t_exposures_with_objects_by_job(job["id"])
                    )
                    job["ccds_with_asteroid"] = self.dsdao.t_ccds_with_objects_by_job(
                        job["id"]
                    )

                    self.update_job(job)

                    # Altera o Status do Job para complete.
                    if (
                        request_heartbeat["exposures_failed"] > 0
                        or loaddata_heartbeat["exposures_failed"] > 0
                    ):
                        job["status"] = 6
                    else:
                        job["status"] = 3

                    if request_heartbeat["exposures"] > 0:
                        summary_result = SummaryResult()
                        summary_result.by_job(job["id"])

                        if job["summary"] == True:
                            summary_result.run_by_year()
                            summary_result.run_by_dynclass()

                            # Removido na issue #791
                            # Tabela de Asteroids sera atualizada por um novo serviço.
                            #  Executa o Update na tabela de Asteroids.
                            # self.update_asteroid_table(job["id"])

                        self.logger_import.info("Summary result finished!")

                    # If Debug is False, Remove output Directory and all files returned by skybot
                    if job["debug"] == False:
                        self.delete_positions_dir(job["id"])

                    # Calcula o tempo total de execução do Job.
                    t0 = job["start"]
                    t1 = datetime.now(timezone.utc)
                    tdelta = t1 - t0
                    job["finish"] = t1
                    job["execution_time"] = tdelta

                    # Grava as informações do job no banco de dados.
                    self.complete_job(job)

                    # Notify User Finish Job
                    self.notify_finish_job(job["id"])

                    self.logger_import.info(
                        "Job successfully completed %s"
                        % humanize.naturaldelta(tdelta, minimum_unit="seconds")
                    )

        except FileNotFoundError as e:
            # A primeira vez que é executado o arquivo request heartbeat pode não existir.
            self.logger_import.debug(e)

        except json.decoder.JSONDecodeError as e:
            trace = traceback.format_exc()
            self.logger_import.error(trace)
            self.logger_import.error(e)

        except Exception as e:
            trace = traceback.format_exc()
            self.logger_import.error(trace)
            self.logger_import.error(e)
            self.on_error(job_id, e)

    # Removido na issue #791
    # Tabela de Asteroids sera atualizada por um novo serviço.
    # def update_asteroid_table(self, job_id):
    #     self.logger_import.info(
    #         "--------------------------------------------------------"
    #     )
    #     self.logger_import.info("Update Asteroid Table Started!")

    #     t0 = datetime.now()
    #     try:
    #         dao = AsteroidDao(pool=False)
    #         count_before = dao.count()
    #         self.logger_import.info(f"Total Asteroid Before Update: [{count_before}]")

    #         count_affected = dao.insert_update()

    #         count_after = dao.count()
    #         self.logger_import.info(f"Total Asteroid After Update: [{count_after}]")

    #         self.logger_import.info(f"Affected Rows: [{count_affected}]")

    #         self.logger_import.info("New Asteroids: [%s]" % (count_after - count_before))

    #     except Exception as e:
    #         trace = traceback.format_exc()
    #         self.logger_import.error(trace)
    #         self.logger_import.error(e)
    #         self.on_error(job_id, e)
    #     finally:
    #         t1 = datetime.now()
    #         tdelta = t1 - t0
    #         self.logger_import.info(
    #             "Update Asteroid Table Finished in %s"
    #             % (str(humanize.naturaldelta(tdelta, minimum_unit="seconds")),)
    #         )
    #         self.logger_import.info(
    #             "--------------------------------------------------------"
    #         )

    def on_error(self, job_id, e):
        """Encerra o job com status de erro.
        é chamada nas funções de controle do pipeline. ao ocorrer uma excessão não tratada.

        Arguments:
            job_id {int} -- Id do job que está sendo executado.
            e {Exception} -- Execessão lançada durante a execução.
        """
        try:
            # Recupera o Model pelo ID
            job = self.get_job_by_id(job_id)

            # Altera o Status do Job para Failed.
            t0 = job["start"]
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            job["finish"] = t1
            job["execution_time"] = tdelta
            job["status"] = 4
            job["error"] = str(e)

            self.complete_job(job)

            self.notify_fail_job(job_id)

        except Exception as e:
            trace = traceback.format_exc()
            self.logger.error(trace)
            self.logger_import.error(e)

    def on_abort(self, job_id, reason=None):
        """Encerra o job com status de Abortado.
        é chamada nas funções de controle do pipeline. ao ocorrer uma AbortSkybotJobError.

        Arguments:
            job_id {int} -- Id do job que está sendo executado.
        """
        try:
            job = self.get_job_by_id(job_id)

            # Altera o Status do Job para Failed.
            t0 = job["start"]
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            job["finish"] = t1
            job["execution_time"] = tdelta
            job["status"] = 5

            job["error"] = reason

            self.complete_job(job)

            self.notify_abort_job(job_id)

        except Exception as e:
            trace = traceback.format_exc()
            self.logger.error(trace)
            self.logger_import.error(e)

    def check_job_timeout(self):
        # Verificar se já existe algum job com status Running.
        a_running = self.spdao.get_by_status(2)

        if len(a_running) > 0:
            # Recupera o Model pelo ID
            job = self.get_job_by_id(a_running[0]["id"])
            try:
                request_heartbeat = self.read_request_heartbeat(job["path"])

                if (
                    request_heartbeat["status"] == "running"
                    and request_heartbeat["last_state"]["current"]
                    == request_heartbeat["current"]
                ):
                    now = datetime.now()
                    last = datetime.fromisoformat(
                        request_heartbeat["last_state"]["time"]
                    )
                    tdelta = now - last

                    if tdelta.total_seconds() >= self.timeout:
                        msg = (
                            "The Job has been frozen for %s seconds in the same operation and was marked to be aborted by timeout."
                            % self.timeout
                        )
                        self.logger.warning(msg)

                        self.write_status_json(job["id"], "aborted", reason=msg)

                loaddata_heartbeat = self.read_loaddata_dataframe(job["path"])

                if (
                    loaddata_heartbeat["status"] == "running"
                    and loaddata_heartbeat["last_state"]["current"]
                    == loaddata_heartbeat["current"]
                ):
                    now = datetime.now()
                    last = datetime.fromisoformat(
                        loaddata_heartbeat["last_state"]["time"]
                    )
                    tdelta = now - last

                    if tdelta.total_seconds() >= self.timeout:
                        msg = (
                            "The Job has been frozen for %s seconds in the same operation and was marked to be aborted by timeout."
                            % self.timeout
                        )
                        self.logger_import.warning(msg)

                        self.write_status_json(job["id"], "aborted", reason=msg)
            except:
                # Os arquivos de heartbeat podem não ter sido criados ainda.
                pass

    def notify_start_job(self, job_id):
        try:
            # Recupera o Model pelo ID
            job = self.get_job_by_id(job_id)
            user = self.spdao.get_user(job["owner_id"])

            context = dict(
                {
                    "username": user["username"],
                    "job_id": job["id"],
                    "start": job["date_initial"],
                    "end": job["date_final"],
                    "nights": job["nights"],
                    "exposures": job["exposures"],
                    "ccds": job["ccds"],
                }
            )

            Notify().send_html_email(
                subject="Skybot Job %s Started" % job_id,
                to=user["email"],
                template="notification_skybot_start.html",
                context=context,
            )

            self.logger.info("Sending start email to the user")

        except Exception as e:
            trace = traceback.format_exc()
            self.logger.error(trace)
            self.logger.error(e)

    def notify_finish_job(self, job_id):
        try:
            # Recupera o Model pelo ID
            job = self.get_job_by_id(job_id)
            user = self.spdao.get_user(job["owner_id"])

            context = dict(
                {
                    "username": user["username"],
                    "job_id": job["id"],
                    "start": job["date_initial"],
                    "end": job["date_final"],
                    "job_start": job["start"].strftime("%Y-%m-%d %H:%M:%S"),
                    "job_end": job["finish"].strftime("%Y-%m-%d %H:%M:%S"),
                    "execution_time": str(job["execution_time"]).split(".")[0],
                    "nights": job["nights"],
                    "exposures": job["exposures"],
                    "exposures_with_asteroid": job["exposures_with_asteroid"],
                    "ccds": job["ccds"],
                    "ccds_with_asteroid": job["ccds_with_asteroid"],
                    "positions": job["positions"],
                    "asteroids": job["asteroids"],
                }
            )

            Notify().send_html_email(
                subject="Skybot Job %s Finished" % job_id,
                to=user["email"],
                template="notification_skybot_finish.html",
                context=context,
            )

            self.logger_import.info("Sending Finish email to the user")

        except Exception as e:
            trace = traceback.format_exc()
            self.logger_import.error(trace)
            self.logger_import.error(e)

    def notify_fail_job(self, job_id):
        try:
            # Recupera o Model pelo ID
            job = self.get_job_by_id(job_id)
            user = self.spdao.get_user(job["owner_id"])

            context = dict(
                {
                    "username": user["username"],
                    "job_id": job["id"],
                    "job_start": job["start"].strftime("%Y-%m-%d %H:%M:%S"),
                    "job_end": job["finish"].strftime("%Y-%m-%d %H:%M:%S"),
                    "execution_time": str(job["execution_time"]).split(".")[0],
                }
            )

            Notify().send_html_email(
                subject="Skybot Job %s Failed" % job_id,
                to=user["email"],
                template="notification_skybot_fail.html",
                context=context,
            )

            self.logger_import.info("Sending Fail email to the user")

        except Exception as e:
            trace = traceback.format_exc()
            self.logger_import.error(trace)
            self.logger_import.error(e)

    def notify_abort_job(self, job_id):
        try:
            # Recupera o Model pelo ID
            job = self.get_job_by_id(job_id)
            user = self.spdao.get_user(job["owner_id"])

            context = dict(
                {
                    "username": user["username"],
                    "job_id": job["id"],
                    "job_start": job["start"].strftime("%Y-%m-%d %H:%M:%S"),
                    "job_end": job["finish"].strftime("%Y-%m-%d %H:%M:%S"),
                    "execution_time": str(job["execution_time"]).split(".")[0],
                }
            )

            Notify().send_html_email(
                subject="Skybot Job %s Aborted" % job_id,
                to=user["email"],
                template="notification_skybot_abort.html",
                context=context,
            )

            self.logger_import.info("Sending Abort email to the user")

        except Exception as e:
            trace = traceback.format_exc()
            self.logger_import.error(trace)
            self.logger_import.error(e)
