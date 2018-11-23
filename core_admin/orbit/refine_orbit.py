import os, errno
import logging
from sqlalchemy.sql import select, or_, func, text, case
from sqlalchemy.sql.expression import literal_column
from tno.db import DBBase
import csv
from .bsp_jpl import BSPJPL
from orbit.observations import GetObservations
from orbit.orbital_parameters import GetOrbitalParameters
from common.jsonfile import JsonFile
from datetime import datetime, timedelta
import humanize
from tno.proccess import ProccessManager
import shutil
from praia.astrometry import Astrometry
import docker
from django.conf import settings
import json
from statistics import mean
from .models import OrbitRun, RefinedAsteroid, RefinedOrbit, RefinedOrbitInput
from common.docker import calculate_cpu_percent2, calculate_cpu_percent, calculate_network_bytes, calculate_blkio_bytes, \
    get_container_stats
import json
import pytimeparse
import parsl
from parsl import *
from statistics import mean
class RefineOrbit():
    def __init__(self):
        self.logger = logging.getLogger("refine_orbit")

        self.bsp_jpl_input_file = None
        self.observations_input_file = None

        self.proccess = None
        self.input_list = None
        self.objects_dir = None

        self.relative_path = None

        self.results = dict({
            "status": "running",
            "error_msg": None,
            "start_time": None,
            "finish_time": None,
            "execution_time": None,
            "execution_download_time": None,
            "execution_nima_time": None,
            "execution_register_time": None,
            "count_objects": 0,
            "count_executed": 0,
            "count_not_executed": 0,
            "average_time": 0,
            "objects_dir": None,
            "input_list": None,
            "proccess": None,
            "objects": dict()
        })

        self.execution_time = []

    def startRefineOrbitRun(self, run_id):
        self.logger.debug("ORBIT RUN: %s" % run_id)

        instance = OrbitRun.objects.get(pk=run_id)

        start_time = datetime.now()
        self.results["start_time"] = start_time.replace(microsecond=0).isoformat(' ')

        # Recuperar a Instancia do processo
        self.proccess = instance.proccess

        self.logger.debug("PROCCESS: %s" % self.proccess.id)
        self.logger.debug("PROCCESS DIR: %s" % self.proccess.relative_path)

        self.results["proccess"] = self.proccess.id

        # Diretorio onde ficam os inputs e resultados separados por objetos.
        self.objects_dir = os.path.join(self.proccess.relative_path, "objects")

        self.relative_path = instance.relative_path

        self.results["objects_dir"] = self.objects_dir

        # recuperar a Custom List usada como input
        self.input_list = instance.input_list
        self.logger.debug("CUSTOM LIST: %s - %s" % (self.input_list.id, self.input_list.displayname))

        self.results["input_list"] = self.input_list.id

        instance.status = 'running'
        instance.save()

        try:
            self.logger.info("Status changed to Running")

            # Criar um diretorio para os arquivos do NIMA
            instance = RefineOrbit().createRefienOrbitDirectory(instance)

            # Json file with step states:
            self.logger.info("Writing status file")
            steps = dict({
                "observations": False,
                "orbital_parameters": False,
                "bsp_jpl": False
            })
            steps_file = os.path.join(instance.relative_path, 'steps.json')
            JsonFile().write(steps, steps_file)

            # Tempo maximo de validade para os arquivos baixados em dias.
            # TODO: pode vir como parametro da interface, None para atualizar todos.
            max_age = 30

            self.logger.info("Starting Download")

            t_download_0 = datetime.now()
            # ---------------------- Observations --------------------------------------------------------------------------

            self.logger.debug(
                "---------------------- Observations --------------------------------------------------------------------------")
            # Pesquisando as observacoes que precisam ser baixadas
            observations = RefineOrbitDB().get_observations(self.input_list.tablename, self.input_list.schema, max_age)

            self.observations_input_file = os.path.join(instance.relative_path, 'observations.csv')

            self.logger.info("Writing Observations Input File")
            RefineOrbit().writer_refine_orbit_file_list(self.observations_input_file, observations)

            # Download das Observations
            self.getObservations(instance, self.observations_input_file, steps_file)

            # ---------------------- Orbital Parameters --------------------------------------------------------------------
            self.logger.debug(
                "---------------------- Orbital Parameters --------------------------------------------------------------------")
            # Pesquisando os parametros orbitais que precisam ser baixadas
            orbital_parameters = RefineOrbitDB().get_orbital_parameters(self.input_list.tablename, self.input_list.schema,
                                                                        max_age)

            self.orbital_parameters_input_file = os.path.join(instance.relative_path, 'orbital_parameters.csv')

            self.logger.info("Writing Orbital Parameters Input File")
            self.writer_refine_orbit_file_list(self.orbital_parameters_input_file, orbital_parameters)

            # Download dos parametros Orbitais
            self.getOrbitalParameters(instance, self.orbital_parameters_input_file, steps_file)

            # ---------------------- BSPs ----------------------------------------------------------------------------------
            self.logger.debug(
                "---------------------- BSPs ----------------------------------------------------------------------------------")
            # Pesquisando os bsp_jpl que precisam ser baixadas
            bsp_jpl = RefineOrbitDB().get_bsp_jpl(self.input_list.tablename, self.input_list.schema, max_age)

            self.bsp_jpl_input_file = os.path.join(instance.relative_path, 'bsp_jpl.csv')

            self.logger.info("Writing BSP JPL Input File")
            RefineOrbit().writer_refine_orbit_file_list(self.bsp_jpl_input_file, bsp_jpl)

            # Download dos BSP JPL
            self.getBspJplFiles(instance, self.bsp_jpl_input_file, steps_file)

            t_download_1 = datetime.now()
            t_download_delta = t_download_1 - t_download_0

            self.results["execution_download_time"] = t_download_delta.total_seconds()

            self.logger.info("Download Finish in %s" % humanize.naturaldelta(t_download_delta))

            # ---------------------- Objects -------------------------------------------------------------------------------

            t_nima_0 = datetime.now()

            # Recuperando os Objetos
            objects, obj_count = ProccessManager().get_objects(tablename=self.input_list.tablename,
                                                            schema=self.input_list.schema)

            self.results["count_objects"] = obj_count

            self.logger.debug("Objects: %s" % obj_count)

            for obj in objects:
                obj_name = obj.get("name").replace(" ", "_")

                self.results["objects"][obj_name] = dict({
                    "name": obj.get("name"),
                    "number": obj.get("num"),
                    "alias": obj_name,
                    "relative_path": self.get_object_dir(obj.get("name"), self.objects_dir),
                    "status": None,
                    "error_msg": None,
                    "start_time": None,
                    "finish_time": None,
                    "execution_time": None,
                    "absolute_path": None,
                    "inputs": dict({
                        "observations": None,
                        "orbital_parameters": None,
                        "bsp_jpl": None,
                        "astrometry": None,
                        "nima_config": None,
                    }),
                    "results": dict({
                        "bsp_nima": None,
                        "residual_all_v2": None, 
                        "residual_all_v1": None,
                        "residual_recent": None,
                        "comparison_nima_jpl_ra": None,
                        "comparison_nima_jpl_dec": None,
                        "comparison_bsp_integration": None,
                        # Arquivos Opcionais
                        "correl_mat": None,
                        "sigyr_res": None,
                        "offset_oth_obs": None,
                        "ci_ast_dat": None,
                        "offset_oth_dat": None,
                        "ephemni_res": None,
                        "omc_ast_res": None,
                        "ephembsp_res": None,
                        "cov_mat": None,
                    })
                })

            # ---------------------- Inputs --------------------------------------------------------------------------------
            self.logger.info("Collect Inputs by Objects")

            self.logger.debug("Objects Dir: %s" % self.objects_dir)

            # Separa os inputs necessarios no diretorio individual de cada objeto.
            # TODO: Essa etapa pode ser paralelizada com Parsl
            self.collect_inputs_by_objects(self.results["objects"], self.objects_dir)

            # ---------------------- Running NIMA --------------------------------------------------------------------------
            self.logger.info("Running NIMA for all objects")
            self.run_nima(self.results["objects"], self.objects_dir)

            t_nima_1 = datetime.now()
            t_nima_delta = t_nima_1 - t_nima_0

            self.results["execution_nima_time"] = t_nima_delta.total_seconds()

            # ---------------------- Recording the results. ----------------------------------------------------------------

            t_register_0 = datetime.now()
            # Iterate over objects
            for alias in self.results["objects"]:
                obj = self.results["objects"][alias]

                self.register_refined_asteroid(obj, instance)

            t_register_1 = datetime.now()
            t_register_delta = t_register_1 - t_register_0

            self.results["execution_register_time"] = t_register_delta.total_seconds()

            # ---------------------- Finish --------------------------------------------------------------------------------

            instance.start_time = self.results["start_time"]
            finish_time = datetime.now()
            instance.finish_time = finish_time

            self.results["finish_time"] = finish_time.replace(microsecond=0).isoformat(' ')
            tdelta = finish_time - start_time
            self.results["execution_time"] = tdelta.total_seconds()
            # Average Time per object
            average_time = 0
            if len(self.execution_time) > 0:
                average_time = mean(self.execution_time)

            self.results["average_time"] = average_time

            self.results["status"] = "success"

            # Escrever os Resultados no results.json
            result_file = os.path.join(instance.relative_path, "results.json")
            with open(result_file, "w") as fp:
                json.dump(self.results, fp)

            # Se nao tiver nenhum resultado, marcar como falha
            instance.status = "failure"
            if self.results["nima_report"]["count_success"] > 0:
                instance.status = "success"

            instance.execution_time = tdelta
            instance.execution_download_time = t_download_delta
            instance.execution_nima_time = t_nima_delta
            instance.execution_register_time = t_register_delta
            instance.average_time = average_time
            instance.count_objects = obj_count
            instance.count_executed = self.results["count_executed"]
            instance.count_not_executed = self.results["count_not_executed"]
            instance.count_success = self.results["nima_report"]["count_success"]
            instance.count_failed = self.results["nima_report"]["count_failed"]
            instance.count_warning = self.results["nima_report"]["count_warning"]

            instance.save()

            self.logger.info("Finish Refine Orbit")

        except Exception as e:
            self.logger.error(e)
            self.logger.error("Failed to execute Refine Orbit")

            finish_time = datetime.now()
            tdelta = finish_time - start_time

            instance.status = "failure"
            instance.execution_time = tdelta
            instance.save()

            raise(e)

    def getObservations(self, instance, input_file, step_file):
        """
            Executa a etapa de download dos arquivos Observations vindo do AstDys ou MPC,
            essa etapa verifica quantos arquivos precisam ser baixados, faz o download
            e os arquivos ficam disponiveis no diretorio externo ao processo.

        :param instance:
        """
        try:
            GetObservations().run(
                input_file=input_file,
                output_path=instance.relative_path,
                step_file=step_file)
        except Exception as e:
            self.logger.error(e)
            raise (e)

    def getOrbitalParameters(self, instance, input_file, step_file):
        """
            Executa a etapa de download dos arquivos Orbital Parametros vindo do AstDys ou MPC,
            essa etapa verifica quantos arquivos precisam ser baixados, faz o download
            e os arquivos ficam disponiveis no diretorio externo ao processo.

        :param instance:
        """
        try:
            GetOrbitalParameters().run(input_file=input_file, output_path=instance.relative_path, step_file=step_file)
        except Exception as e:
            self.logger.error(e)
            raise (e)

    def getBspJplFiles(self, instance, input_file, step_file):
        """
            Executa a etapa de download dos arquivos bsp vindo do JPL,
            essa etapa verifica quantos arquivos precisam ser baixados, faz o download
            e os arquivos ficam disponiveis no diretorio externo ao processo.

        :param instance:
        """
        try:
            BSPJPL().run(input_file=input_file, output_path=instance.relative_path, step_file=step_file)
        except Exception as e:
            self.logger.error(e)
            raise (e)

    def createRefienOrbitDirectory(self, instance):

        proccess = instance.proccess
        # Criar um diretorio para o Refine Orbit
        directory_name = "refine_orbit_%s" % instance.id
        directory = os.path.join(proccess.relative_path, directory_name)

        try:
            # Criar o Diretorio
            os.makedirs(directory)

            if os.path.exists(directory):
                # Alterar a Permissao do Diretorio
                os.chmod(directory, 0o775)

                self.logger.info("Refine Orbit directory created")
                self.logger.debug("Directory: %s" % directory)

                instance.relative_path = directory
                instance.save()

                return instance
            else:
                instance.status = 'error'
                instance.save()
                msg = "Failed to create refine orbit directory [ %s ]" % directory
                self.logger.error(msg)
                raise Exception(msg)


        except OSError as e:
            instance.status = 'error'
            instance.save()
            self.logger.error("Failed to create refine orbit directory [ %s ]" % directory)
            if e.errno != errno.EEXIST:
                self.logger.error(e)
                raise

    def writer_refine_orbit_file_list(self, file_path, records):
        """

        """
        self.logger.debug("Input File: %s" % file_path)

        header_orb_param = ["name", "num", "filename", "need_download"]

        with open(file_path, 'w') as csvfile:
            fieldnames = header_orb_param
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=';', extrasaction='ignore')

            writer.writeheader()

            # Fix boolean field
            for row in records:
                row.update({
                    "need_download": bool(row.get("need_download"))
                })

                writer.writerow(row)

        return file_path

    def collect_inputs_by_objects(self, objects, objects_path):

        for alias in objects:
            obj = objects[alias]

            obj_dir = self.get_object_dir(obj.get("name"), objects_path)

            self.logger.debug("Object Dir: %s" % obj_dir)

            # TODO: Essa etapa pode ser paralelizada com Parsl
            # Copiar os Arquivos de Observacoes
            try:
                observations_file = self.copy_observation_file(obj, obj_dir)
            except Exception as e:
                self.logger.error("Failed to retrieve Observations Input")
                self.logger.error(e)

            # Copiar os Arquivos de Orbital Parameters
            try:
                orbital_parameters_file = self.copy_orbital_parameters_file(obj, obj_dir)
            except Exception as e:
                self.logger.error("Failed to retrieve Orbital Parameters Input")
                self.logger.error(e)

            # Copiar os Arquivos de BSP_JPL
            try:
                bsp_jpl_file = self.copy_bsp_jpl_file(obj, obj_dir)
            except Exception as e:
                self.logger.error("Failed to retrieve BSP JPL Input")
                self.logger.error(e)

            # Verificar se o Arquivo do PRAIA (Astrometry position) existe no diretorio do objeto.
            try:
                astrometry_position_file = self.verify_astrometry_position_file(obj, obj_dir)
            except Exception as e:
                self.logger.error("Failed to retrieve Astrometry Input")
                self.logger.error(e)

            status = None
            error_msg = None

            if not observations_file:
                status = "failure"
                error_msg = "Missing Input Observations"

            if not orbital_parameters_file:
                status = "failure"
                error_msg = "Missing Input Orbital Parameters"

            if not bsp_jpl_file:
                status = "failure"
                error_msg = "Missing Input BSP JPL"

            if not astrometry_position_file:
                status = "failure"
                error_msg = "Missing Input Astrometry Positions"

            if status is not None:
                self.results["objects"][alias]["status"] = status
                self.results["objects"][alias]["error_msg"] = error_msg
                self.results["count_not_executed"] += 1

    def get_object_dir(self, name, objects_path):
        obj_name = name.replace(" ", "_")
        return os.path.join(objects_path, obj_name)

    def copy_observation_file(self, obj, obj_dir):

        # Copiar arquivo de Observacoes do Objeto.
        original_observation_file, observation = GetObservations().get_file_path(obj.get("name"))

        if original_observation_file is not None and observation is not None:

            filename = observation.filename

            # Rename object_name.* -> objectname.*
            filename = filename.replace('_', '')

            new_file_path = os.path.join(obj_dir, filename)

            shutil.copy2(original_observation_file, new_file_path)

            if os.path.exists(new_file_path):
                self.results["objects"][obj.get("alias")]["inputs"]["observations"] = dict({
                    "filename": os.path.basename(new_file_path),
                    "file_path": new_file_path,
                    "file_size": os.path.getsize(new_file_path),
                    "file_type": os.path.splitext(new_file_path)[1],
                    "date_time": datetime.strftime(observation.download_finish_time, "%Y-%m-%d %H:%M:%S"),
                    "source": observation.source,
                    "observation_file_id": observation.id
                })

                self.logger.debug("Object [ %s ] Observation File: %s" % (obj.get("name"), new_file_path))

                return new_file_path
            else:
                self.logger.error(
                    "Failed to copy Observations File: %s -> %s" % (original_observation_file, obj_dir))
                return None
        else:
            self.logger.warning("Object [ %s ] has no Observations File" % obj.get("name"))
            return None

    def copy_orbital_parameters_file(self, obj, obj_dir):

        original_file, orb_parameter = GetOrbitalParameters().get_file_path(obj.get("name"))

        if original_file is not None:
            filename = orb_parameter.filename
            # Rename object_name.* -> objectname.*
            filename = filename.replace('_', '')

            new_file_path = os.path.join(obj_dir, filename)

            shutil.copy2(original_file, new_file_path)

            if os.path.exists(new_file_path):
                self.results["objects"][obj.get("alias")]["inputs"]["orbital_parameters"] = dict({
                    "filename": os.path.basename(new_file_path),
                    "file_path": new_file_path,
                    "file_size": os.path.getsize(new_file_path),
                    "file_type": os.path.splitext(new_file_path)[1],
                    "date_time": datetime.strftime(orb_parameter.download_finish_time, "%Y-%m-%d %H:%M:%S"),
                    "source": orb_parameter.source,
                    "orbital_parameter_file_id": orb_parameter.id
                })

                self.logger.debug("Object [ %s ] Orbital Parameters File: %s" % (obj.get("name"), new_file_path))

                return new_file_path
            else:
                self.logger.error(
                    "Failed to copy Orbital Parameters File: %s -> %s" % (original_file, obj_dir))
                return None
        else:
            self.logger.warning("Object [ %s ] has no Orbital Parameters File" % obj.get("name"))
            return None

    def copy_bsp_jpl_file(self, obj, obj_dir):

        original_file, bsp_file = BSPJPL().get_file_path(obj.get("name"))

        if original_file is not None:
            filename = bsp_file.filename

            # Rename bsp_jpl object_name.bsp -> objectname.bsp
            filename = filename.replace('_', '')

            new_file_path = os.path.join(obj_dir, filename)

            shutil.copy2(original_file, new_file_path)

            if os.path.exists(new_file_path):

                self.results["objects"][obj.get("alias")]["inputs"]["bsp_jpl"] = dict({
                    "filename": os.path.basename(new_file_path),
                    "file_path": new_file_path,
                    "file_size": os.path.getsize(new_file_path),
                    "file_type": os.path.splitext(new_file_path)[1],
                    "date_time": datetime.strftime(bsp_file.download_finish_time, "%Y-%m-%d %H:%M:%S"),
                    "source": "JPL",
                    "bsp_file_id": bsp_file.id
                })

                self.logger.debug("Object [ %s ] BSP_JPL File: %s" % (obj.get("name"), new_file_path))

                return new_file_path
            else:
                self.logger.error(
                    "Failed to copy BSP_JPL File: %s -> %s" % (original_file, obj_dir))
                return None
        else:
            self.logger.warning("Object [ %s ] has no BSP_JPL File" % obj.get("name"))
            return None

    def verify_astrometry_position_file(self, obj, obj_dir):
        """
            Verifica se o Arquivo de Astrometric observed ICRF positions
        gerado pela etapa de Astrometria esta disponivel no Diretorio do Objeto
        :param obj:
        :param obj_dir:
        :return: File path do arquivo ou None caso nao exista.
        """

        # TODO: este metodo deveria estar dentro da classe de Astrometria

        filename = Astrometry().get_astrometry_position_filename(obj.get("name"))

        filename = filename.replace('_obs', '').replace('_', '')
        file_path = os.path.join(obj_dir, filename)

        if os.path.exists(file_path):
            # TODO recuperar informacoes da execucao de Astrometria.
            self.results["objects"][obj.get("alias")]["inputs"]["astrometry"] = dict({
                "filename": os.path.basename(file_path),
                "file_path": file_path,
                "file_size": os.path.getsize(file_path),
                "file_type": os.path.splitext(file_path)[1],
                "date_time": datetime.strftime(datetime.now(), "%Y-%m-%d %H:%M:%S"),
                "source": None,
            })

            self.logger.debug("Object [ %s ] Astrometry File: %s" % (obj.get("name"), file_path))

        else:
            self.logger.warning("Object [ %s ] has no Astrometry File" % obj.get("name"))
            file_path = None

        return file_path

    def run_nima(self, objects, objects_path):

        t0 = datetime.now()

        # Configuracao do Parsl
        try:
            dfk = DataFlowKernel(
                config=dict(settings.PARSL_CONFIG))

        except Exception as e:
            self.logger.error(e)
            raise e


        # Configuracao do Parsl Log.
        parsl.set_file_logger(os.path.join(self.relative_path, 'nima_parsl.log'))

        # Declaracao do Parsl APP
        @App("python", dfk)
        def start_parsl_job(id, obj, logger):
            t0 = datetime.now()

            # Criar o arquivo com parametros de entrada
            nima_config = self.nima_input_file(obj)

            result = self.run_nima_container(id, obj)

            t1 = datetime.now()
            tdelta = t1 - t0

            obj["status"] = result['status']
            obj["error_msg"] = result['error_msg']
            obj["start_nima"] = t0.replace(microsecond=0).isoformat(' ')
            obj["finish_nima"] = t1.replace(microsecond=0).isoformat(' ')
            obj["execution_nima"] = str(tdelta)

            # Input 
            obj["inputs"]["nima_config"] = dict({
                "filename": os.path.basename(nima_config),
                "file_path": nima_config,
                "file_size": os.path.getsize(nima_config),
                "file_type": os.path.splitext(nima_config)[1]
            })

            # Results 
            if result['status'] != "failure":
                obj["results"]["bsp_nima"] = result["bsp_nima"]
                obj["results"]["residual_all_v2"] = result["residual_all_v2"]
                obj["results"]["residual_all_v1"] = result["residual_all_v1"]
                obj["results"]["residual_recent"] = result["residual_recent"]
                obj["results"]["comparison_nima_jpl_ra"] = result["comparison_nima_jpl_ra"]
                obj["results"]["comparison_nima_jpl_dec"] = result["comparison_nima_jpl_dec"]
                obj["results"]["comparison_bsp_integration"] = result["comparison_bsp_integration"]
                # Arquivos Opcionais                
                obj["results"]["correl_mat"] = result["correl_mat"]
                obj["results"]["sigyr_res"] = result["sigyr_res"]
                obj["results"]["offset_oth_obs"] = result["offset_oth_obs"]
                obj["results"]["ci_ast_dat"] = result["ci_ast_dat"]
                obj["results"]["offset_oth_dat"] = result["offset_oth_dat"]
                obj["results"]["ephemni_res"] = result["ephemni_res"]
                obj["results"]["omc_ast_res"] = result["omc_ast_res"]
                obj["results"]["ephembsp_res"] = result["ephembsp_res"]
                obj["results"]["cov_mat"] = result["cov_mat"]

            if result['status'] == 'success':
                msg = "[ SUCCESS ] - Object: %s Time: %s " % (
                    obj['name'], humanize.naturaldelta(tdelta))
            else:
                msg = "[ FAILURE ] - Object: %s " % obj['name']

            logger.info(msg)

            return obj

        # executa o app Parsl para cara registro em paralelo
        results = []
        id = 0
        for alias in objects:
            obj = objects[alias]

            if obj['status'] is not 'failure':
                result = start_parsl_job(
                    id=id,
                    obj=obj,
                    logger=self.logger)

                results.append(result)

            id += 1

        # Espera o Resultado de todos os jobs.
        outputs = [i.result() for i in results]

        for i in results:
            i.done()

        dfk.cleanup()

        count = len(outputs)
        failure = 0
        warning = 0
        average = []
        for row in outputs:
            if row['status'] == "failure":
                failure += 1
                average.append(0)
            elif row['status'] == "warning":
                warning += 1

            exec_tdelta = timedelta(seconds=pytimeparse.parse(row['execution_nima']))
            average.append(exec_tdelta.total_seconds())

            self.execution_time.append(pytimeparse.parse(row['execution_nima']))

            self.results['objects'][row['alias']] = row

        t1 = datetime.now()
        tdelta = t1 - t0

        maverage = 0
        if len(average) > 0:
            maverage = mean(average)

        self.results['nima_report'] = dict({
            'start_time': t0.replace(microsecond=0).isoformat(' '),
            'finish_time': t1.replace(microsecond=0).isoformat(' '),
            'execution_time': str(tdelta),
            'count_asteroids': count,
            'count_success': count - failure,
            'count_failed': failure,
            'count_warning': warning,
            'average_time': maverage,
        })

        self.logger.info(
            "Finished refine orbit, %s asteroids in %s" % (
                count, humanize.naturaldelta(tdelta)))


    def run_nima_container(self, id, obj):
        """ 
            Cria uma instancia do Container NIMA 
            e executa o comando run.py
        """
        self.logger.info("Generating Refined Orbit")

        alias = obj["alias"]

        data_path = obj['relative_path']

        # Get docker Client Instance
        self.logger.debug("Getting docker client")
        docker_client = docker.DockerClient(
            base_url=settings.DOCKER_HOST)

        # Recupera a Imagem Docker
        docker_image = self.get_docker_image(
            docker_client=docker_client,
            image_name="linea/nima:7")

        # Path absoluto para o diretorio de dados que sera montado no container.
        absolute_archive_path = settings.HOST_ARCHIVE_DIR
        absolute_data_path = os.path.join(absolute_archive_path, data_path.strip('/'))
        self.logger.debug("Absolute Data Path: %s" % absolute_data_path)        

        self.results["objects"][alias]["absolute_path"] = absolute_data_path

        # TODO o command pode passar o nome e numero do objeto.
        cmd = "python /app/run.py"

        volumes = dict({})
        volumes[absolute_data_path] = {
            'bind': '/data',
            'mode': 'rw'
        }

        try:
            self.logger.debug("Starting Container NIMA [ %s ]" % id)

            container = docker_client.containers.run(
                docker_image,
                command=cmd,
                detach=True,
                auto_remove=True,
                mem_limit='1024m',
                volumes=volumes
            )
            container.wait()
            self.logger.debug("Finish Container NIMA [ %s ]" % id)

            status = "failure"
            error_msg = None

            # Verificar se a Orbita foi gerada
            # TODO alterar o nome do arquivo bsp.
            # file_nima_bsp = os.path.join(data_path, "%s_nima.bsp" % obj["alias"].replace('_', ''))
            file_nima_bsp = os.path.join(data_path, "%s_%s_nima.bsp" % (obj["number"], obj["alias"].replace('_', '')))

            omc_sep = os.path.join(data_path, "omc_sep.png")
            omc_sep_all = os.path.join(data_path, "omc_sep_all.png")
            omc_sep_recent = os.path.join(data_path, "omc_sep_recent.png")
            diff_nima_jpl_ra = os.path.join(data_path, "diff_nima_jpl_RA.png")
            diff_nima_jpl_dec = os.path.join(data_path, "diff_nima_jpl_Dec.png")
            diff_bsp_ni = os.path.join(data_path, "diff_bsp-ni.png")
            # Arquivos Opcionais
            correl_mat = os.path.join(data_path, "correl.mat")
            sigyr_res = os.path.join(data_path, "sigyr.res")
            offset_oth_obs = os.path.join(data_path, "offset_oth.obs")
            ci_ast_dat = os.path.join(data_path, "CI_ast.dat")
            offset_oth_dat = os.path.join(data_path, "offset_oth.dat")
            ephemni_res = os.path.join(data_path, "ephemni.res")
            omc_ast_res = os.path.join(data_path, "omc_ast.res")
            ephembsp_res = os.path.join(data_path, "ephembsp.res")
            cov_mat = os.path.join(data_path, "cov.mat")

            if os.path.exists(file_nima_bsp):
                status = "success"

                if not os.path.exists(omc_sep) or not os.path.exists(omc_sep_all) or not os.path.exists(omc_sep_recent):
                    status = "warning"
                    error_msg = "One or more of the omc sep charts was not created"

                if not os.path.exists(diff_nima_jpl_ra) or not os.path.exists(diff_nima_jpl_dec) or not os.path.exists(diff_bsp_ni):
                    status = "warning"
                    error_msg = "One or more of the diff nima jpl charts was not created"
               
                if not os.path.exists(correl_mat):
                    correl_mat = None
                if not os.path.exists(sigyr_res):
                    sigyr_res = None
                if not os.path.exists(offset_oth_obs):
                    offset_oth_obs = None
                if not os.path.exists(ci_ast_dat):
                    ci_ast_dat = None
                if not os.path.exists(offset_oth_dat):
                    offset_oth_dat = None
                if not os.path.exists(ephemni_res):
                    ephemni_res = None
                if not os.path.exists(omc_ast_res):
                    omc_ast_res = None
                if not os.path.exists(ephembsp_res):
                    ephembsp_res = None
                if not os.path.exists(cov_mat):
                    cov_mat = None

            else:
                return dict({
                    "status": "failure",
                    "error_msg": "NIMA BSP was not created"
                })


            result = dict({
                "status": status,
                "error_msg": error_msg,
                "bsp_nima": file_nima_bsp,
                "residual_all_v2": omc_sep, 
                "residual_all_v1": omc_sep_all,
                "residual_recent": omc_sep_recent,
                "comparison_nima_jpl_ra": diff_nima_jpl_ra,
                "comparison_nima_jpl_dec": diff_nima_jpl_dec,
                "comparison_bsp_integration": diff_bsp_ni,
                # Arquivos Opcionais
                "correl_mat": correl_mat,
                "sigyr_res": sigyr_res,
                "offset_oth_obs": offset_oth_obs,
                "ci_ast_dat": ci_ast_dat,
                "offset_oth_dat": offset_oth_dat,
                "ephemni_res": ephemni_res,
                "omc_ast_res": omc_ast_res,
                "ephembsp_res": ephembsp_res,
                "cov_mat": cov_mat,
            })

            return result

        except docker.errors.ContainerError as e:
            self.logger.error(e)
            container.stop()
            container.remove()

            return dict({
                "status": "failure",
                "error_msg": "Container NIMA failed: %s" % e
            })


    def nima_input_file(self, obj):
        # TODO: Precisa de um refactoring, os parametros podem vir da interface.
        try:

            input_file = os.path.join(obj['relative_path'], "input.txt")

            with open("orbit/nima_input_template.txt") as file:

                data = file.read()

                data = data.replace('{number}', obj.get("number"))

                data = data.replace('{name}', obj.get("name").replace('_', '').replace(' ', ''))

                with open(input_file, 'w') as new_file:
                    new_file.write(data)

            return input_file

        except Exception as e:
            self.logger.error(e)
            raise (e)


    def register_refined_asteroid(self, obj, orbit_run):

        self.logger.debug("Registering Object %s" % obj.get("name"))

        try:

            try:
                t0 = datetime.strptime(obj.get("start_time"), '%Y-%m-%d %H:%M:%S')

            except:
                t0 = None
            try:
                t1 = datetime.strptime(obj.get("finish_time"), '%Y-%m-%d %H:%M:%S')
            except:
                t1 = None

            if t0 is not None and t1 is not None:
                t_delta = t1 - t0
            else:
                t_delta = None

            asteroid, created = RefinedAsteroid.objects.update_or_create(
                orbit_run=orbit_run,
                name=obj.get("name"),
                defaults={
                    'number': obj.get("number"),
                    'status': obj.get("status"),
                    'error_msg': obj.get("error_msg"),
                    'start_time': t0,
                    'finish_time': t1,
                    'execution_time': t_delta,
                    'relative_path': obj.get("relative_path"),
                    'absolute_path': obj.get("absolute_path")
                })

            asteroid.save()

            l_created = "Created"

            # Apaga todas os resultados caso seja um update
            if not created:
                l_created = "Updated"

                for orbit in asteroid.refined_orbit.all():
                    orbit.delete()

            for ftype in obj.get("results"):
                result = obj.get("results").get(ftype)
                if result is not None:
                    filename = os.path.basename(result) 
                    file_size = os.path.getsize(result)
                    file_type = os.path.splitext(result)[1]

                    orbit, created = RefinedOrbit.objects.update_or_create(
                        asteroid=asteroid,
                        filename=filename,
                        type=ftype,
                        defaults={
                            'file_size': file_size,
                            'file_type': file_type,
                            'relative_path': result,
                        }
                    )

                    orbit.save()

            # Registra os Inputs Utilizados
            for input_type in obj.get("inputs"):
                inp = obj.get("inputs").get(input_type)

                if inp is not None:
                    input_file, created = RefinedOrbitInput.objects.update_or_create(
                        asteroid=asteroid,
                        input_type=input_type,
                        defaults={
                            'source': inp.get("source"),
                            'date_time': inp.get("date_time"),
                            'filename': inp.get("filename"),
                            'relative_path': inp.get("file_path"),
                        }
                    )

                    input_file.save()

            self.logger.info("Registered Object %s %s" % (obj.get("name"), l_created))

        except Exception as e:
            self.logger.error("Failed to Register Object %s Error: %s" % (obj.get("name"), e))


    def get_docker_image(self, docker_client, image_name):

        docker_image = None
        try:
            docker_image = docker_client.images.get(image_name)

            self.logger.debug("Image docker already exists")

        except docker.errors.ImageNotFound as e:
            # Imagem Nao encontrada Tentando baixar a imagem

            self.logger.debug("Image docker does not exist trying to download")
            docker_image = docker_client.images.pull(image_name)

            if not docker_image:
                msg = "Docker Image %s not available" % image_name
                self.logger.error(msg)
                raise msg

        except docker.errors.APIError as e:
            self.logger.error(e)
            raise e

        except Exception as e:
            self.logger.error(e)
            raise e

        self.logger.debug("Image Docker: %s" % docker_image)

        return docker_image

class RefineOrbitDB(DBBase):
    def get_observations(self, tablename, schema=None, max_age=None):
        """
            SELECT a.name, a.num, b.download_finish_time, CASE WHEN (b.download_finish_time < now() - INTERVAL '30 DAY') THEN true ELSE false END AS need_download  FROM martin_test_list AS a LEFT OUTER JOIN orbit_observationfile AS b ON a.name = b.name GROUP BY a.name, a.num, b.download_finish_time ORDER BY a.name
        """

        table = self.get_table_observations_file()

        stm = self._get_stm_download_tables_record(tablename, table, schema, max_age)

        rows = self.fetch_all_dict(stm)

        return rows

    def get_orbital_parameters(self, tablename, schema=None, max_age=None):
        """
        """
        table = self.get_table_orbital_parameters_file()

        stm = self._get_stm_download_tables_record(tablename, table, schema, max_age)

        rows = self.fetch_all_dict(stm)

        return rows

    def get_bsp_jpl(self, tablename, schema=None, max_age=None):
        """
        """

        table = self.get_table_bsp_jpl_file()

        stm = self._get_stm_download_tables_record(tablename, table, schema, max_age)

        rows = self.fetch_all_dict(stm)

        return rows

    def _get_stm_download_tables_record(self, tablename, join_table, schema=None, max_age=None):

        tbl = self.get_table(tablename, schema).alias('a')
        tbl2 = join_table.alias('b')

        stm_join = tbl.join(
            tbl2, tbl.c.name == tbl2.c.name, isouter=True)

        cols = [
            tbl.c.name,
            tbl.c.num,
            tbl2.c.filename,
            tbl2.c.download_finish_time,
        ]

        if max_age is None:
            cols.append(
                literal_column('True').label('need_download')
            )
        else:
            cols.append(
                case(
                    [
                        (tbl2.c.download_finish_time < (
                            func.now() - text('INTERVAL \'%s DAY\'' % int(max_age))), True),
                        (tbl2.c.download_finish_time.is_(None), True)
                    ],
                    else_=False
                ).label('need_download'),
            )

        stm = select(cols).select_from(stm_join)

        # Agrupamento
        stm = stm.group_by(
            tbl.c.name,
            tbl.c.num,
            tbl2.c.filename,
            tbl2.c.download_finish_time)

        # Ordenacao
        stm = stm.order_by(tbl.c.name)

        return stm


