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
from datetime import datetime
import humanize
from tno.proccess import ProccessManager
import shutil
from praia.astrometry import Astrometry
import docker
from django.conf import settings
import json
from statistics import mean


class RefineOrbit():
    def __init__(self):
        self.logger = logging.getLogger("refine_orbit")

        self.bsp_jpl_input_file = None
        self.observations_input_file = None

        self.proccess = None
        self.input_list = None
        self.objects_dir = None

        self.results = dict({
            "status": "running",
            "error_msg": None,
            "start_time": None,
            "finish_time": None,
            "execution_time": None,
            "count_objects": 0,
            "count_executed": 0,
            "count_not_executed": 0,
            "count_success": 0,
            "count_failed": 0,
            "average_time": 0,
            "objects_dir": None,
            "input_list": None,
            "proccess": None,
            "objects": dict()
        })

        self.execution_time = []

    def startRefineOrbitRun(self, instance):
        self.logger.debug("ORBIT RUN: %s" % instance.id)

        start_time = datetime.now()
        self.results["start_time"] = start_time.replace(microsecond=0).isoformat(' ')

        # Recuperar a Instancia do processo
        self.proccess = instance.proccess

        self.logger.debug("PROCCESS: %s" % self.proccess.id)
        self.logger.debug("PROCCESS DIR: %s" % self.proccess.relative_path)

        self.results["proccess"] = self.proccess.id

        # Diretorio onde ficam os inputs e resultados separados por objetos.
        self.objects_dir = os.path.join(self.proccess.relative_path, "objects")

        self.results["objects_dir"] = self.objects_dir

        # recuperar a Custom List usada como input
        self.input_list = instance.input_list
        self.logger.debug("CUSTOM LIST: %s - %s" % (self.input_list.id, self.input_list.displayname))

        self.results["input_list"] = self.input_list.id

        instance.status = 'running'
        instance.save()
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

        t0 = datetime.now()
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

        t1 = datetime.now()
        tdelta = t1 - t0
        self.logger.info("Download Finish in %s" % humanize.naturaldelta(tdelta))

        # ---------------------- Objects -------------------------------------------------------------------------------

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
                "object_dir": self.get_object_dir(obj.get("name"), self.objects_dir),
                "status": None,
                "error_msg": None,
                "start_time": None,
                "finish_time": None,
                "execution_time": None,
                "real_absolute_path": None,
                "inputs": dict({
                    "observations": None,
                    "orbital_parameters": None,
                    "bsp_jpl": None,
                    "astrometry": None
                }),
                "results": list()
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

        # ---------------------- Finish --------------------------------------------------------------------------------

        finish_time = datetime.now()
        instance.finish_time = finish_time

        self.results["finish_time"] = finish_time.replace(microsecond=0).isoformat(' ')
        tdelta = finish_time - start_time
        self.results["execution_time"] = humanize.naturaldelta(tdelta)
        # Average Time per object
        self.results["average_time"] = mean(self.execution_time)

        result_file = os.path.join(instance.relative_path, "results.json")
        with open(result_file, "w") as fp:
            json.dump(self.results, fp)

        instance.status = "success"
        instance.save()

        self.logger.info("Finish Refine Orbit")

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
            observations_file = self.copy_observation_file(obj, obj_dir)

            # Copiar os Arquivos de Orbital Parameters
            orbital_parameters_file = self.copy_orbital_parameters_file(obj, obj_dir)

            # Copiar os Arquivos de BSP_JPL
            bsp_jpl_file = self.copy_bsp_jpl_file(obj, obj_dir)

            # Verificar se o Arquivo do PRAIA (Astrometry position) existe no diretorio do objeto.
            astrometry_position_file = self.verify_astrometry_position_file(obj, obj_dir)

            status = None
            error_msg = None

            if observations_file:
                # self.logger.debug()
                self.results["objects"][alias]["inputs"]["observations"] = dict({
                    "filename": os.path.basename(observations_file),
                    "file_path": observations_file,
                    "file_size": os.path.getsize(observations_file),
                    "file_type": os.path.splitext(observations_file)[1]
                })


            else:
                status = "failure"
                error_msg = "Missing Input Observations"

            if orbital_parameters_file:
                self.results["objects"][alias]["inputs"]["orbital_parameters"] = dict({
                    "filename": os.path.basename(orbital_parameters_file),
                    "file_path": orbital_parameters_file,
                    "file_size": os.path.getsize(orbital_parameters_file),
                    "file_type": os.path.splitext(orbital_parameters_file)[1]
                })

            else:
                status = "failure"
                error_msg = "Missing Input Orbital Parameters"

            if bsp_jpl_file:
                self.results["objects"][alias]["inputs"]["bsp_jpl"] = dict({
                    "filename": os.path.basename(bsp_jpl_file),
                    "file_path": bsp_jpl_file,
                    "file_size": os.path.getsize(bsp_jpl_file),
                    "file_type": os.path.splitext(bsp_jpl_file)[1]
                })

            else:
                status = "failure"
                error_msg = "Missing Input BSP JPL"

            if astrometry_position_file:
                self.results["objects"][alias]["inputs"]["astrometry"] = dict({
                    "filename": os.path.basename(astrometry_position_file),
                    "file_path": astrometry_position_file,
                    "file_size": os.path.getsize(astrometry_position_file),
                    "file_type": os.path.splitext(astrometry_position_file)[1]
                })

            else:
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
        original_observation_file = GetObservations().get_file_path(obj.get("name"), obj.get("number"))

        if original_observation_file is not None:
            filename = os.path.basename(original_observation_file)

            # Rename object_name.* -> objectname.*
            filename = filename.replace('_', '')

            new_file_path = os.path.join(obj_dir, filename)

            shutil.copy2(original_observation_file, new_file_path)

            if os.path.exists(new_file_path):
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

        original_file = GetOrbitalParameters().get_file_path(obj.get("name"), obj.get("number"))

        if original_file is not None:
            filename = os.path.basename(original_file)

            # Rename object_name.* -> objectname.*
            filename = filename.replace('_', '')

            new_file_path = os.path.join(obj_dir, filename)

            shutil.copy2(original_file, new_file_path)

            if os.path.exists(new_file_path):
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

        original_file = BSPJPL().get_file_path(obj.get("name"), obj.get("number"))

        if original_file is not None:
            filename = os.path.basename(original_file)

            # Rename bsp_jpl object_name.bsp -> objectname.bsp
            filename = filename.replace('_', '')

            new_file_path = os.path.join(obj_dir, filename)

            shutil.copy2(original_file, new_file_path)

            if os.path.exists(new_file_path):
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
            self.logger.debug("Object [ %s ] Astrometry File: %s" % (obj.get("name"), file_path))

        else:
            self.logger.warning("Object [ %s ] has no Astrometry File" % obj.get("name"))
            file_path = None

        return file_path

    def run_nima(self, objects, objects_path):

        # Get docker Client Instance
        client = docker.DockerClient(base_url=settings.DOCKER_HOST)

        image_name = "linea/nima:7"

        try:
            nima_image = client.images.get(image_name)

        except docker.errors.ImageNotFound as e:
            # Imagem Nao encontrada Tentando baixar a imagem
            nima_image = client.images.pull(image_name)

        except docker.errors.APIError as e:
            self.logger.error(e)
            raise (e)

        if not nima_image:
            raise ("Docker Image NIMA not available")

        count = 0
        for alias in objects:
            obj = objects[alias]

            if obj["status"] is not "failure":

                self.logger.debug("Running for object %s" % obj["name"])

                self.results["objects"][alias]["status"] = "running"
                tstart = datetime.now()

                input_path = os.path.join(objects_path, alias)

                nima_log = os.path.join(input_path, "nima.log")

                self.nima_input_file(obj, input_path)

                real_archive_path = settings.HOST_ARCHIVE_DIR

                real_input_path = os.path.join(real_archive_path, input_path.strip('/'))

                self.results["objects"][alias]["real_absolute_path"] = real_input_path

                # TODO o command pode passar o nome e numero do objeto.
                cmd = "python /app/run.py"

                volumes = dict({})
                volumes[real_input_path] = {
                    'bind': '/data',
                    'mode': 'rw'
                }

                status = "FAILURE"
                try:

                    self.logger.debug("Starting Container NIMA")

                    running_t0 = datetime.now()

                    container = client.containers.run(
                        nima_image,
                        command=cmd,
                        detach=True,
                        name="nima_%s" % count,
                        auto_remove=True,
                        mem_limit='1024m',
                        volumes=volumes
                    )

                    log_data = ""
                    # Logging
                    try:
                        for line in container.logs(stream=True):
                            line = str(line.strip().decode("utf-8"))
                            log_data += "%s\n" % line

                            # self.logger.debug(line)

                        with open(nima_log, 'w') as f_nima_log:
                            f_nima_log.write(log_data)

                    except Exception as e:
                        self.logger.error(e)

                    self.logger.debug("Finish Container NIMA")

                    running_t1 = datetime.now()
                    running_tdelta = running_t1 - running_t0

                    if log_data.find("SUCCESS"):
                        status = "SUCCESS"
                        self.results["objects"][alias]["status"] = "success"
                        self.results["count_success"] += 1


                    elif log_data.find("WARNING"):
                        self.results["objects"][alias]["status"] = "warning"
                        self.results["count_success"] += 1

                    else:
                        self.results["objects"][alias]["status"] = "failure"
                        self.results["objects"][alias][
                            "error_msg"] = "NIMA did not return success, see log for more information"
                        self.results["count_failed"] += 1


                except docker.errors.ContainerError as e:
                    self.logger.error(e)
                    self.results["count_failed"] += 1
                    self.results["objects"][alias]["status"] = "failure"
                    self.results["objects"][alias][
                        "error_msg"] = "Container NIMA failed"

                tfinish = datetime.now()
                tdelta = tfinish - tstart

                self.execution_time.append(tdelta.total_seconds())

                self.results["objects"][alias]["start_time"] = tstart.replace(microsecond=0).isoformat(' ')
                self.results["objects"][alias]["finish_time"] = tfinish.replace(microsecond=0).isoformat(' ')
                self.results["objects"][alias]["execution_time"] = tdelta.total_seconds()

                self.results["count_executed"] += 1

                self.results["objects"][alias]["results"] = self.nima_check_results(self.results["objects"][alias])

                self.logger.info("NIMA Object [ %s ] STATUS [ %s ] Execution Time: %s" % (
                obj["name"], status, humanize.naturaldelta(tdelta)))

            else:
                self.logger.warning("Did not run NIMA for object %s" % obj["name"])

    def nima_input_file(self, obj, input_path):

        # TODO: Precisa de um refactoring, os parametros podem vir da interface.

        try:

            input_file = os.path.join(input_path, "input.txt")

            with open("orbit/nima_input_template.txt") as file:

                data = file.read()

                data = data.replace('{number}', obj.get("number"))

                data = data.replace('{name}', obj.get("name").replace('_', '').replace(' ', ''))

                with open(input_file, 'w') as new_file:
                    new_file.write(data)


        except Exception as e:
            self.logger.error(e)
            raise (e)

    def nima_check_results(self, obj):

        results = list()

        inputs = list()
        for i in obj["inputs"]:
            f_input = obj["inputs"][i]
            inputs.append(f_input["filename"])

        files = os.listdir(obj["object_dir"])

        for f in files:

            if f not in inputs:
                file_path = os.path.join(obj["object_dir"], f)

                results.append(dict({
                    "filename": f,
                    "file_size": os.path.getsize(file_path),
                    "file_path": file_path,
                    "file_type": os.path.splitext(file_path)[1]
                }))

        return results


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
