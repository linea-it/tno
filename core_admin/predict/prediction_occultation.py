import logging
from datetime import datetime, timedelta
import pytimeparse
import os, errno
from django.conf import settings
import shutil
import docker
import humanize
import time
from tno.proccess import ProccessManager
import parsl
from parsl import *
import json
from statistics import mean
from tno.db import CatalogDB
from sqlalchemy.sql import text
from .models import PredictRun, PredictAsteroid, PredictInput, PredictOutput, Occultation
from tno.models import JohnstonArchive
from django.db.models import Q
import csv

class PredictionOccultation():
    def __init__(self):
        self.logger = logging.getLogger("predict_occultation")

        self.archive_dir = settings.ARCHIVE_DIR
        self.process = None
        self.input_list = None
        self.catalog = None
        self.objects_dir = None
        self.relative_path = None

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
            "count_warning": 0,
            "average_time": 0,
            "objects_dir": None,
            "input_list": None,
            "process": None,
            "objects": dict(),
            "dates_file_report": dict(),
            "ephemeris_report": dict(),
            "maps_report": dict(),
        })

        self.leap_second = None
        self.dates_file = None

        self.gaia_properties = ["ra", "ra_error", "dec", "dec_error", "parallax", "pmra", "pmra_error", "pmdec",
                                "pmdec_error", "duplicated_source", "phot_g_mean_flux", "phot_g_mean_flux_error",
                                "phot_g_mean_mag", "phot_variable_flag"]

        # Nomes dos outputs do PRAIA Occ Star Search
        self.stars_catalog_mini = 'g4_micro_catalog_JOHNSTON_2018'
        self.stars_catalog_xy = 'g4_occ_catalog_JOHNSTON_2018'
        self.stars_parameters_of_occultation = 'g4_occ_data_JOHNSTON_2018'
        self.stars_parameters_of_occultation_plot = 'g4_occ_data_JOHNSTON_2018_table'
        self.occultation_table = 'occultation_table.csv'

        # Lista de tempo de execucao de cada asteroid incluindo o tempo de espera.
        self.execution_time = []

    def start_predict_occultation(self, run_id):

        self.logger.debug("PREDICT RUN: %s" % run_id)

        instance = PredictRun.objects.get(pk=run_id)

        start_time = datetime.now()
        self.results["start_time"] = start_time.replace(microsecond=0).isoformat(' ')

        instance.start_time = datetime.now()

        # Recuperar a Instancia do processo
        self.process = instance.process
        self.results["process"] = self.process.id

        self.logger.debug("PROCESS: %s" % self.process.id)
        self.logger.debug("PROCESS DIR: %s" % self.process.relative_path)

        # Recuperar a Instancia do Catalogo
        self.catalog = instance.catalog
        if not self.catalog:
            raise "Catalog is required"

        # Diretorio onde ficam os inputs e resultados separados por objetos.
        self.objects_dir = os.path.join(self.process.relative_path, "objects")

        self.results["objects_dir"] = self.objects_dir

        # recuperar a Custom List usada como input
        self.input_list = instance.input_list
        self.logger.debug("CUSTOM LIST: %s - %s" % (self.input_list.id, self.input_list.displayname))

        self.results["input_list"] = self.input_list.id

        instance.status = 'running'
        instance.count_objects = self.input_list.asteroids
        instance.save()
        self.logger.info("Status changed to Running")

        try:

            instance = self.create_directory(instance)

            # 1 - Leap Seconds -----------------------------------------------------------------------------------------
            self.leap_second = self.copy_leap_seconds_file(instance)

            self.logger.info("Step 1")

            # 2 - Generate Dates ---------------------------------------------------------------------------------------
            start_date = datetime.strftime(instance.ephemeris_initial_date, '%Y-%b-%d %H:%M:%S').upper()
            end_date = datetime.strftime(instance.ephemeris_final_date, '%Y-%b-%d %H:%M:%S').upper()
            step = instance.ephemeris_step
            self.radius = instance.catalog_radius

            dates_filename = "dates.txt"
            dates_file = self.run_generate_dates(
                data_path=instance.relative_path,
                start_date=start_date,
                end_date=end_date,
                step=step,
                leap_second=os.path.basename(self.leap_second),
                filename=dates_filename
            )
            self.results["dates_file_report"] = dates_file
            self.dates_file = dates_file.get("file_path")

            self.logger.info("Step 2")

            # 3 - BSP Planetary ----------------------------------------------------------------------------------------
            self.bsp_planetary = self.copy_bsp_planetary(instance)

            self.logger.info("Step 3")

            # 4 - Objetos ----------------------------------------------------------------------------------------------
            # Recuperando os Objetos
            objects, obj_count = ProccessManager().get_objects(tablename=self.input_list.tablename,
                                                               schema=self.input_list.schema)

            self.results["count_objects"] = obj_count

            self.logger.debug("Objects: %s" % obj_count)

            orbit_run = instance.input_orbit

            for obj in objects:

                obj_name = obj.get("name").replace(" ", "_")

                obj_relative_path = os.path.join(self.get_object_dir(obj.get("name"), self.objects_dir))

                # Criar link simbolico para o arquivo de datas.
                dates_file = os.path.basename(self.dates_file)
                dates_file_path = os.path.join(obj_relative_path, dates_file)
                if os.path.exists(dates_file_path):
                    os.remove(dates_file_path)

                shutil.copy2(self.dates_file, dates_file_path)

                # Criar link simbolico para o arquivo bsp_planetary
                bsp_planetary = os.path.basename(self.bsp_planetary)
                bsp_planetary_path = os.path.join(obj_relative_path, bsp_planetary)
                if os.path.exists(bsp_planetary_path):
                    os.remove(bsp_planetary_path)

                shutil.copy2(self.bsp_planetary, bsp_planetary_path)

                # Criar link simbolico para o arquivo lealeap_second
                leap_second = os.path.basename(self.leap_second)
                leap_second_path = os.path.join(obj_relative_path, leap_second)
                if os.path.exists(leap_second_path):
                    os.remove(leap_second_path)

                shutil.copy2(self.leap_second, leap_second_path)

                # Renomear BSP do JPL
                bsp_name = "%s.bsp" % obj_name.replace('_', '')
                bsp_jpl_name = "%s_JPL.bsp" % obj_name.replace('_', '')
                if not os.path.exists(os.path.join(obj_relative_path, bsp_jpl_name)):
                    os.rename(
                        os.path.join(obj_relative_path, bsp_name),
                        os.path.join(obj_relative_path, bsp_jpl_name))

                # BSP gerada pelo NIMA
                bsp_nima_name = '%s_nima.bsp' % obj_name.replace('_', '')
                if os.path.exists(os.path.join(obj_relative_path, bsp_nima_name)):
                    os.rename(
                        os.path.join(obj_relative_path, bsp_nima_name),
                        os.path.join(obj_relative_path, bsp_name))

                # Recuperar o Diametro dos asteroids usando os dados do Jhonston Archive
                ja_queryset = JohnstonArchive.objects.filter(
                    Q(name=obj.get("name")) | Q(provisional_designation=obj.get("name")) | Q(number=obj.get("num")))
                
                # Definir um valor padrao para o diametro do asteroid quando nao houver (200km).
                diameter = 200 
                if ja_queryset.count() == 1:
                    self.logger.debug("[ %s ] It has a diameter" % obj.get("name"))
                    asteroid_data = ja_queryset.first()
                    if asteroid_data.diameter and asteroid_data.diameter > 0:
                        diameter = asteroid_data.diameter
                else:
                    self.logger.warning("[ %s ] has no Diameter" % obj.get("name"))

                status = None
                orbit_run_asteroid = orbit_run.asteroids.get(name=obj.get("name"))
                self.logger.debug("Orbit RUN Asteroid %s" % orbit_run_asteroid)
                self.logger.debug("Orbit RUN Asteroid Status %s" % orbit_run_asteroid.status)

                if orbit_run_asteroid is not None and orbit_run_asteroid.status == 'failure':
                    status = 'not_executed'

                self.results["objects"][obj_name] = dict({
                    "name": obj.get("name"),
                    "number": obj.get("num"),
                    "alias": obj_name,
                    "diameter": diameter,
                    "relative_path": obj_relative_path,
                    "status": status,
                    "error_msg": None,
                    "start_ephemeris": None,
                    "finish_ephemeris": None,
                    "execution_ephemeris": None,
                    "absolute_path": None,
                    "inputs": dict({
                        "dates_file": dates_file,
                        "bsp_planetary": bsp_planetary,
                        "bsp_asteroid": bsp_name,
                        "leap_second": leap_second,
                        "positions": None,
                        "ephemeris": None,
                        "catalog": None,
                    }),
                    "results": dict({
                        "ephemeris": None,
                        "radec": None,
                        "positions": None,
                        "catalog": None,
                        "catalog_csv": None,
                        "stars_catalog_mini": None,
                        "stars_catalog_xy": None,
                        "stars_parameters_of_occultation": None,
                        "stars_parameters_of_occultation_plot": None,
                        "occultation_table": None
                    })
                })

            self.logger.info("Step 4")

            # 5 - Generate Ephemeris -----------------------------------------------------------------------------------
            self.generate_ephemeris()

            self.logger.info("Step 5")

            # 6 - Generate Catalog Gaia --------------------------------------------------------------------------------
            self.generate_gaia_catalog()

            self.logger.info("Step 6")

            # 7 - Run PRAIA OCC Star Search 12 -------------------------------------------------------------------------
            self.search_candidate_stars()

            self.logger.info("Step 7")

            # 8 - Generate Maps ----------------------------------------------------------------------------------------
            self.generate_maps()

            self.logger.info("Step 8")
            # 9 - Recording the results. -------------------------------------------------------------------------------

            t_register_0 = datetime.now()
            # Iterate over objects
            for alias in self.results["objects"]:
                obj = self.results["objects"][alias]

                # Registrar os Asteroids e o Resultado.
                self.register_asteroid(obj, instance)

            t_register_1 = datetime.now()
            t_register_delta = t_register_1 - t_register_0

            self.results["execution_register_time"] = t_register_delta.total_seconds()

            self.logger.info("Step 9")
            # 10 - Finish ----------------------------------------------------------------------------------------------
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

            csuccess = instance.asteroids.filter(status='success').count()
            cfailed = instance.asteroids.filter(status='failed').count()
            cwarning = instance.asteroids.filter(status='warning').count()
            cnotexecuted = instance.asteroids.filter(status='not_executed').count()

            self.results["status"] = "success"

            if cfailed == obj_count:
                self.results["status"] = "failure"

            # Escrever os Resultados no results.json
            result_file = os.path.join(instance.relative_path, "results.json")
            with open(result_file, "w") as fp:
                json.dump(self.results, fp)

            instance.status = "success"
            instance.execution_time = tdelta

            instance.execution_dates = self.results["dates_file_report"]["execution_time"]
            instance.execution_ephemeris = self.results["ephemeris_report"]["execution_time"]
            instance.execution_catalog = self.results["gaia_catalog_report"]["execution_time"]
            instance.execution_search_candidate = self.results["search_candidate_report"]["execution_time"]
            instance.execution_maps = self.results["maps_report"]["execution_time"]

            instance.execution_register = str(t_register_delta)
            instance.average_time = average_time
            instance.count_objects = obj_count

            instance.count_success = csuccess
            instance.count_failed = cfailed
            instance.count_warning = cwarning
            instance.count_not_executed = cnotexecuted

            instance.save()

            self.logger.info("Finish Prediction Occultation")

        except Exception as e:
            self.logger.error(e)
            self.logger.error("Failed to execute prediction occultation")

            finish_time = datetime.now()
            tdelta = finish_time - start_time

            instance.status = "failure"
            instance.execution_time = tdelta
            instance.save()

            raise(e)



    def create_directory(self, instance):

        process = instance.process
        # Criar um diretorio para a Predicao de Occultacao
        directory_name = "prediction_occultation_%s" % instance.id
        directory = os.path.join(process.relative_path, directory_name)

        try:
            # Criar o Diretorio
            os.makedirs(directory)
            time.sleep(2)
            if os.path.exists(directory):
                # Alterar a Permissao do Diretorio
                os.chmod(directory, 0o775)

                self.logger.info("Prediction Occultation directory created")
                self.logger.debug("Directory: %s" % directory)

                instance.relative_path = directory
                instance.save()

                self.relative_path = instance.relative_path

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
            self.logger.error("Failed to create prediction occultation directory [ %s ]" % directory)
            if e.errno != errno.EEXIST:
                self.logger.error(e)
                raise

    def copy_leap_seconds_file(self, instance):

        self.logger.info("Copying Leap Seconds [ %s ] to Work Directory" % instance.leap_second.display_name)
        try:
            origin = os.path.join(self.archive_dir, str(instance.leap_second.upload))
            self.logger.debug("Origin: %s" % origin)

            destiny = os.path.join(instance.relative_path, os.path.basename(origin))
            self.logger.debug("Destiny: %s" % destiny)

            shutil.copy2(origin, destiny)

            return destiny

        except Exception as e:
            self.logger.error(e)
            raise e

    def run_generate_dates(self, data_path, start_date, end_date, step, leap_second, filename):
        """
            Cria uma instancia do container PRAIA_Occultation
            e executa o comando generate_dates.py
        :param data_path:
        :param leap_second:
        :param start_date:
        :param end_date:
        :param step:
        :return:
        """
        t0 = datetime.now()
        self.logger.info("Generating file dates.txt")

        # Get docker Client Instance
        self.logger.debug("Getting docker client")
        docker_client = docker.DockerClient(
            base_url=settings.DOCKER_HOST)

        # Recupera a Imagem Docker
        docker_image = self.get_docker_image(
            docker_client=docker_client,
            image_name="linea/praiaoccultation:latest")

        # Path absoluto para o diretorio de dados que sera montado no container.
        absolute_archive_path = settings.HOST_ARCHIVE_DIR
        absolute_data_path = os.path.join(absolute_archive_path, data_path.strip('/'))
        self.logger.debug("Absolute Data Path: %s" % absolute_data_path)

        # Comando que sera executado dentro do container.
        cmd = "python generate_dates.py '%s' '%s' %s --leap_sec %s --filename %s" % (
            start_date, end_date, step, leap_second, filename)
        self.logger.debug("CMD: %s" % cmd)

        # Definicao do Volume /data
        volumes = dict({
            absolute_data_path: dict({
                'bind': '/data',
                'mode': 'rw'
            })
        })

        try:
            self.logger.debug("Starting Container")
            container = docker_client.containers.run(
                docker_image,
                command=cmd,
                detach=True,
                # name="occultation_dates",
                auto_remove=True,
                # mem_limit='128m',
                volumes=volumes,
                user=os.getuid()
            )

            container.wait()
            self.logger.debug("Finish Container")

            t1 = datetime.now()
            tdelta = t1 - t0

            dates_file = os.path.join(self.relative_path, filename)
            if os.path.isfile(dates_file):
                self.logger.info("The generation of the date file took %s." % humanize.naturaldelta(tdelta))
                self.logger.debug("Dates File: %s" % dates_file)

                return dict({
                    'filename': filename,
                    'file_size': os.path.getsize(dates_file),
                    'file_path': dates_file,
                    'start_time': t0.replace(microsecond=0).isoformat(' '),
                    'finish_time': t1.replace(microsecond=0).isoformat(' '),
                    'execution_time': str(tdelta),
                })

            else:
                msg = "%s file was not created" % filename
                self.logger.error(msg)
                raise msg


        except docker.errors.ContainerError as e:
            self.logger.error(e)
            raise e
        except Exception as e:
            self.logger.error(e)
            raise e

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

    def copy_bsp_planetary(self, instance):

        self.logger.info("Copying BSP Planetary [ %s ] to Work Directory" % instance.bsp_planetary.display_name)
        try:
            origin = os.path.join(self.archive_dir, str(instance.bsp_planetary.upload))
            self.logger.debug("Origin: %s" % origin)

            destiny = os.path.join(instance.relative_path, os.path.basename(origin))
            self.logger.debug("Destiny: %s" % destiny)

            shutil.copy2(origin, destiny)

            return destiny

        except Exception as e:
            self.logger.error(e)
            raise e

    def get_object_dir(self, name, objects_path):
        obj_name = name.replace(" ", "_")
        return os.path.join(objects_path, obj_name)

    def generate_ephemeris(self):

        self.logger.info("Generating ephemeris by object")

        t0 = datetime.now()

        # Configuracao do Parsl
        try:
            dfk = DataFlowKernel(
                config=dict(settings.PARSL_CONFIG))

        except Exception as e:
            self.logger.error(e)
            raise e

        self.logger.info("Configuring Parsl")
        self.logger.debug("Parsl Config:")
        self.logger.debug(settings.PARSL_CONFIG)

        # Configuracao do Parsl Log.
        parsl.set_file_logger(os.path.join(self.relative_path, 'ephemeris_parsl.log'))

        # Declaracao do Parsl APP
        @App("python", dfk)
        def start_parsl_job(id, docker_client, docker_image, obj, logger):

            result = self.run_generate_ephemeris(
                id=id,
                docker_client=docker_client,
                docker_image=docker_image,
                obj=obj,
                logger=logger
            )

            if result['status'] == 'failure':
                msg = "[ FAILURE ] - Object: %s " % obj['name']

            else:
                msg = "[ SUCCESS ] - Object: %s Time: %s " % (
                    result['name'], humanize.naturaldelta(result['execution_ephemeris']))

            logger.info(msg)

            return result

        # Get docker Client Instance
        docker_client = docker.DockerClient(
            base_url=settings.DOCKER_HOST)

        # Recupera a Imagem Docker
        docker_image = self.get_docker_image(
            docker_client=docker_client,
            image_name="linea/praiaoccultation:latest")

        # executa o app Parsl para cara registro em paralelo
        results = []
        id = 0
        for alias in self.results['objects']:
            obj = self.results['objects'][alias]

            if obj['status'] is not 'failure' and obj['status'] is not 'not_executed':
                self.results["objects"][alias]["status"] = "running"

                result = start_parsl_job(
                    id=id,
                    docker_client=docker_client,
                    docker_image=docker_image,
                    obj=obj,
                    logger=self.logger)

                self.logger.debug(result)

                results.append(result)

                id += 1

        # Espera o Resultado de todos os jobs.
        outputs = [i.result() for i in results]

        for i in results:
            i.done()

        dfk.cleanup()

        t1 = datetime.now()
        tdelta = t1 - t0

        count = len(outputs)
        failure = 0
        average = []

        maverage = 0

        for row in outputs:
            if row['status'] == "failure":
                failure += 1
                average.append(0)
            exec_tdelta = timedelta(seconds=pytimeparse.parse(row['execution_ephemeris']))
            average.append(exec_tdelta.total_seconds())

            self.results['objects'][row['alias']] = row

        if len(average) > 0:
            maverage = mean(average)

        self.results['ephemeris_report'] = dict({
            'start_time': t0.replace(microsecond=0).isoformat(' '),
            'finish_time': t1.replace(microsecond=0).isoformat(' '),
            'execution_time': str(tdelta),
            'count_asteroids': count,
            'count_success': count - failure,
            'count_failed': failure,
            'average_time': maverage
        })

        self.logger.info(
            "Finished to generate the ephemeris, %s asteroids in %s" % (count, humanize.naturaldelta(tdelta)))

    def run_generate_ephemeris(self, id, docker_client, docker_image, obj, logger):
        """
            Cria uma instancia do container PRAIA_Occultation
            e executa o comando generate_ephemeris.py
            :param data_path:
            :param dates_file:
            :param bsp_asteroid:
            :param bsp_planetary:
            :param leap_second:
            :param filename:
            :param radec_filename:
            :return:
        """
        t0 = datetime.now()

        container_name = "occultation_ephemeris_%s" % id

        filename = "%s.eph" % obj['alias'].replace('_', '')
        radec_filename = "radec.txt"
        positions_filename = "positions.txt"

        # Path absoluto para o diretorio de dados que sera montado no container.
        absolute_archive_path = settings.HOST_ARCHIVE_DIR
        absolute_data_path = os.path.join(absolute_archive_path, obj['relative_path'].strip('/'))

        # Comando que sera executado dentro do container.
        cmd = "python generate_ephemeris.py %s %s %s %s --leap_sec %s --radec_filename %s --positions_filename %s" % (
            obj['inputs']['dates_file'], obj['inputs']['bsp_asteroid'], obj['inputs']['bsp_planetary'], filename,
            obj['inputs']['leap_second'], radec_filename, positions_filename)

        logger.debug("[ %s ] CMD: %s" % (container_name, cmd))

        # Definicao do Volume /data
        volumes = dict({
            absolute_data_path: dict({
                'bind': '/data',
                'mode': 'rw'
            })
        })

        try:
            logger.debug("[ %s ] Starting Container" % container_name)
            container = docker_client.containers.run(
                docker_image,
                command=cmd,
                detach=True,
                # name=container_name,
                auto_remove=True,
                # mem_limit='4096m',
                volumes=volumes,
                user=os.getuid()
            )

            container.wait()
            logger.debug("[ %s ] Finish Container" % container_name)

            ephemeris = os.path.join(obj['relative_path'], filename)
            radec = os.path.join(obj['relative_path'], radec_filename)
            positions = os.path.join(obj['relative_path'], positions_filename)

            logger.debug("[ %s ] Ephemeris: %s" % (container_name, ephemeris))
            logger.debug("[ %s ] RADEC: %s" % (container_name, radec))

            status = "running"
            error_msg = None

            if not os.path.isfile(ephemeris):
                status = "failure"
                error_msg = "Ephemeris file was not created"

            if not os.path.isfile(radec):
                status = "failure"
                error_msg = "RADEC file was not created"

            if not os.path.isfile(positions):
                status = "failure"
                error_msg = "Positions file was not created"

            if status == "running":
                # Result Ephemeris
                obj["results"]["ephemeris"] = dict({
                    "filename": filename,
                    "file_size": os.path.getsize(ephemeris),
                    "file_path": ephemeris,
                    "file_type": os.path.splitext(ephemeris)[1]
                })

                # Result RADEC
                obj["results"]["radec"] = dict({
                    "filename": radec_filename,
                    "file_size": os.path.getsize(radec),
                    "file_path": radec,
                    "file_type": os.path.splitext(radec)[1]
                })

                # Result Positions
                obj["results"]["positions"] = dict({
                    "filename": positions_filename,
                    "file_size": os.path.getsize(positions),
                    "file_path": positions,
                    "file_type": os.path.splitext(positions)[1]
                })

                # Positions e input para a proxima etapa
                obj["inputs"]["positions"] = positions_filename

                # Ephemeris e input para a proxima etapa
                obj["inputs"]["ephemeris"] = os.path.basename(ephemeris)

            t1 = datetime.now()
            tdelta = t1 - t0

            obj["status"] = status
            obj["error_msg"] = error_msg
            obj["start_ephemeris"] = t0.replace(microsecond=0).isoformat(' ')
            obj["finish_ephemeris"] = t1.replace(microsecond=0).isoformat(' ')
            obj["execution_ephemeris"] = str(tdelta)

            return obj

        except docker.errors.ContainerError as e:
            self.logger.error(e)
            raise e
        except Exception as e:
            self.logger.error(e)
            raise e

    def generate_gaia_catalog(self):

        self.logger.info("Generating GAIA Catalog by object")

        t0 = datetime.now()

        # Configuracao do Parsl
        try:
            dfk = DataFlowKernel(
                config=dict(settings.PARSL_CONFIG))

        except Exception as e:
            self.logger.error(e)
            raise e

        self.logger.info("Configuring Parsl")
        self.logger.debug("Parsl Config:")
        self.logger.debug(settings.PARSL_CONFIG)

        # Configuracao do Parsl Log.
        parsl.set_file_logger(os.path.join(self.relative_path, 'gaia_catalog_parsl.log'))

        # Declaracao do Parsl APP
        @App("python", dfk)
        def start_parsl_job(id, catalog, obj, radius, logger):

            t0 = datetime.now()

            # Read Positions file
            positions = self.read_positions(
                filename=os.path.join(obj['relative_path'], obj["inputs"]["positions"]))

            rows = self.run_gaia_catalog(id, catalog, positions, radius, logger)

            filename = self.write_gaia_catalog(rows, path=obj['relative_path'])

            file_size = os.path.getsize(filename)


            # Result Catalog Gaia
            obj["results"]["catalog"] = dict({
                "filename": os.path.basename(filename),
                "file_size": file_size,
                "file_path": filename,
                "file_type": os.path.splitext(filename)[1]
            })

            # Catalog in csv
            filename_csv = self.write_gaia_catalog_csv(rows, path=obj['relative_path'])
            file_size_csv = os.path.getsize(filename_csv)

            # Result Catalog Gaia
            obj["results"]["catalog_csv"] = dict({
                "filename": os.path.basename(filename_csv),
                "file_size": file_size_csv,
                "file_path": filename_csv,
                "file_type": os.path.splitext(filename_csv)[1]
            })


            t1 = datetime.now()
            tdelta = t1 - t0

            crows = len(rows)

            if crows > 0 and filename:
                status = 'success'
                error_msg = None
                msg = "[ SUCCESS ] - Object: %s  Rows: %s  Size: %s Time: %s " % (
                    obj["name"], crows, humanize.naturalsize(file_size), humanize.naturaldelta(tdelta))

            else:
                status = 'failure'
                error_msg = 'Failed to generate gaia catalog.'

                msg = "[ FAILURE ] - Object: %s " % obj['name']

            self.logger.info(msg)

            # Gaia Catalog e input para a proxima etapa
            obj["inputs"]["catalog"] = os.path.basename(filename)

            obj["status"] = status
            obj["error_msg"] = error_msg
            obj["start_gaia_catalog"] = t0.replace(microsecond=0).isoformat(' ')
            obj["finish_gaia_catalog"] = t1.replace(microsecond=0).isoformat(' ')
            obj["execution_gaia_catalog"] = str(tdelta)
            obj["gaia_rows"] = crows

            return obj

        # Retrive Gaia catalog
        gaia = self.catalog

        # executa o app Parsl para cara registro em paralelo
        results = []
        id = 0
        for alias in self.results['objects']:
            obj = self.results['objects'][alias]

            if obj['status'] is not 'failure' and obj['status'] is not 'not_executed':

                result = start_parsl_job(
                    id=id,
                    catalog=gaia,
                    obj=obj,
                    radius=self.radius,
                    logger=self.logger)

                self.logger.debug(result)

                results.append(result)

                id += 1

        # Espera o Resultado de todos os jobs.
        outputs = [i.result() for i in results]

        for i in results:
            i.done()

        dfk.cleanup()

        count = len(outputs)
        failure = 0
        average = []
        crows = []
        maverage = 0
        mcrows = 0
        for row in outputs:
            if row['status'] == "failure":
                failure += 1
                average.append(0)

            exec_tdelta = timedelta(seconds=pytimeparse.parse(row['execution_gaia_catalog']))
            average.append(exec_tdelta.total_seconds())

            crows.append(row['gaia_rows'])

            self.results['objects'][row['alias']] = row

        t1 = datetime.now()
        tdelta = t1 - t0

        if len(average) > 0:
            maverage = mean(average)

        if len(crows) > 0:
            mcrows = mean(crows)

        self.results['gaia_catalog_report'] = dict({
            'start_time': t0.replace(microsecond=0).isoformat(' '),
            'finish_time': t1.replace(microsecond=0).isoformat(' '),
            'execution_time': str(tdelta),
            'count_asteroids': count,
            'count_success': count - failure,
            'count_failed': failure,
            'average_time': maverage,
            'average_rows': mcrows
        })

        self.logger.info(
            "Finished to generate the gaia catalog, %s asteroids in %s" % (count, humanize.naturaldelta(tdelta)))

    def read_positions(self, filename):
        positions = []

        with open(filename, 'r') as fp:
            for line in fp:
                try:
                    line.strip()
                    a = line.split()
                    ra = float(a[0].strip())
                    dec = float(a[1].strip())
                    positions.append([ra, dec])
                except Exception as e:
                    raise e

        return positions

    def run_gaia_catalog(self, id, catalog, positions, radius, logger):
        try:
            db = CatalogDB()

            if catalog.schema is not None:
                tablename = "%s.%s" % (catalog.schema, catalog.tablename)

            columns = ", ".join(self.gaia_properties)

            results = []
            for pos in positions:
                where = 'q3c_radial_query("%s", "%s", % s, % s, % s)' % (
                        catalog.ra_property, catalog.dec_property, pos[0], pos[1], radius)

                stm = """SELECT %s FROM %s WHERE %s """ % (columns, tablename, where)

                rows = db.fetch_all_dict(text(stm))

                results += rows

            if len(results) >= 2100000:
                self.logger.warning("Stellar Catalog too big")
                # TODO marcar o status do Asteroid como warning.
                # TODO implementar funcao para dividir o resutado em lista menores e executar em loop.

            return results

        except Exception as e:
            logger.error(e)
            raise e

    def write_gaia_catalog(self, rows, path):

        # Propriedades do GAIA http://vizier.u-strasbg.fr/viz-bin/VizieR-3?-source=I/345/gaia2&-out.add=_r
        # RA_ICRS   = ra                     = 0
        # e_RA_ICRS = ra_error               = 1
        # DE_ICRS   = dec                    = 2
        # e_DE_ICRS = dec_error              = 3
        # Plx       = parallax               = 4
        # pmRA      = pmra                   = 5
        # e_pmRA    = pmra_error             = 6
        # pmDE      = pmdec                  = 7
        # e_pmDE    = pmdec_error            = 8
        # Dup       = duplicated_source      = 9
        # FG        = phot_g_mean_flux       = 10
        # e_FG      = phot_g_mean_flux_error = 11
        # Gmag      = phot_g_mean_mag        = 12
        # Var       = phot_variable_flag     = 13

        magJ, magH, magK = 99.000, 99.000, 99.000
        JD = 15.0 * 365.25 + 2451545

        filename = os.path.join(path, "gaia_catalog.cat")
        with open(filename, 'w') as fp:
            for row in rows:

                # Converter os valores nulos para 0
                for prop in row:
                    if row[prop] is None:
                        row[prop] = 0

                fp.write(" ".ljust(64))
                fp.write(("%.3f" % row['phot_g_mean_mag']).rjust(6))
                fp.write(" ".ljust(7))
                fp.write(" " + ("%.3f" % magJ).rjust(6))
                fp.write(" " + ("%.3f" % magH).rjust(6))
                fp.write(" " + ("%.3f" % magK).rjust(6))
                fp.write(" ".rjust(35))
                fp.write(" " + ("%.3f" % (row["pmra"] / 1000.0)).rjust(7))
                fp.write(" " + ("%.3f" % (row["pmdec"] / 1000.0)).rjust(7))
                fp.write(" " + ("%.3f" % (row["pmra_error"] / 1000.0)).rjust(7))
                fp.write(" " + ("%.3f" % (row["pmdec_error"] / 1000.0)).rjust(7))
                fp.write(" ".rjust(71))
                fp.write(" " + ("%.9f" % (row["ra"] / 15.0)).rjust(13))
                fp.write(" " + ("%.9f" % row["dec"]).rjust(13))
                fp.write(" ".ljust(24))
                fp.write(("%.8f" % JD).rjust(16))
                fp.write(" ".ljust(119))
                fp.write("  " + ("%.3f" % (row["ra_error"] / 1000.0)).rjust(6))
                fp.write("  " + ("%.3f" % (row["dec_error"] / 1000.0)).rjust(6))
                fp.write("\n")

            fp.close()

        return filename

    def write_gaia_catalog_csv(self, rows, path):
        filename = os.path.join(path, "gaia_catalog.csv")
        with open(filename, 'w') as csvfile:
            fieldnames = ['ra', 'dec']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=';')
            for row in rows:
                ra = float(row["ra"])
                ra = "%.9f" % ra
                
                dec = "%.9f" % row["dec"]

                writer.writerow({'ra': ra, 'dec': dec})

            csvfile.close()

        return filename


    def search_candidate_stars(self):

        self.logger.info("Generating the table with the candidate stars")

        t0 = datetime.now()

        # Configuracao do Parsl
        try:
            dfk = DataFlowKernel(
                config=dict(settings.PARSL_CONFIG))

        except Exception as e:
            self.logger.error(e)
            raise e

        self.logger.info("Configuring Parsl")
        self.logger.debug("Parsl Config:")
        self.logger.debug(settings.PARSL_CONFIG)

        # Configuracao do Parsl Log.
        parsl.set_file_logger(os.path.join(self.relative_path, 'search_candidate_stars.log'))

        # Declaracao do Parsl APP
        @App("python", dfk)
        def start_parsl_job(id, obj, logger):

            t0 = datetime.now()

            # Criar arquivo .dat baseado no template.
            praia_occ_dat = self.praia_occ_input_file(obj)

            logger.debug("PRAIA OCC DAT: %s" % praia_occ_dat)

            result = self.run_search_candidate_stars(
                obj['relative_path'], os.path.basename(praia_occ_dat)
            )

            status = 'failure'
            error_msg = 'PRAIA Occultation did not generate result files.'

            if result:
                status = 'running'
                error_msg = None
                try:
                    # TODO essa parte pode ficar funcao run_search_candidate_stars
                    file_path = os.path.join(obj['relative_path'], self.stars_catalog_mini)
                    obj['results']['stars_catalog_mini'] = dict({
                        "filename": os.path.basename(file_path),
                        "file_size": os.path.getsize(file_path),
                        "file_path": file_path,
                        "file_type": os.path.splitext(file_path)[1]
                    })

                    file_path = os.path.join(obj['relative_path'], self.stars_catalog_xy)
                    obj['results']['stars_catalog_xy'] = dict({
                        "filename": os.path.basename(file_path),
                        "file_size": os.path.getsize(file_path),
                        "file_path": file_path,
                        "file_type": os.path.splitext(file_path)[1]
                    })

                    file_path = os.path.join(obj['relative_path'], self.stars_parameters_of_occultation)
                    obj['results']['stars_parameters_of_occultation'] = dict({
                        "filename": os.path.basename(file_path),
                        "file_size": os.path.getsize(file_path),
                        "file_path": file_path,
                        "file_type": os.path.splitext(file_path)[1]
                    })

                    file_path = os.path.join(obj['relative_path'], self.stars_parameters_of_occultation_plot)
                    obj['results']['stars_parameters_of_occultation_plot'] = dict({
                        "filename": os.path.basename(file_path),
                        "file_size": os.path.getsize(file_path),
                        "file_path": file_path,
                        "file_type": os.path.splitext(file_path)[1]
                    })

                    file_path = os.path.join(obj['relative_path'], self.occultation_table)
                    obj['results']['occultation_table'] = dict({
                        "filename": os.path.basename(file_path),
                        "file_size": os.path.getsize(file_path),
                        "file_path": file_path,
                        "file_type": os.path.splitext(file_path)[1]
                    })

                except Exception as e:
                    logger.error("Object [ %s ] Id [ %s ] %s" %(obj['name'], id, e))
                    status = 'failure'
                    error_msg = e

            t1 = datetime.now()
            tdelta = t1 - t0

            obj["status"] = status
            obj["error_msg"] = error_msg
            obj["start_search_candidate"] = t0.replace(microsecond=0).isoformat(' ')
            obj["finish_search_candidate"] = t1.replace(microsecond=0).isoformat(' ')
            obj["execution_search_candidate"] = str(tdelta)

            return obj

        # executa o app Parsl para cara registro em paralelo
        results = []
        id = 0
        for alias in self.results['objects']:
            obj = self.results['objects'][alias]

            if obj['status'] is not 'failure' and obj['status'] is not 'not_executed':
                result = start_parsl_job(
                    id=id,
                    obj=obj,
                    logger=self.logger)

                self.logger.debug(result)

                results.append(result)

                id += 1

        # Espera o Resultado de todos os jobs.
        outputs = [i.result() for i in results]

        for i in results:
            i.done()

        dfk.cleanup()

        count = len(outputs)
        failure = 0
        average = []
        maverage = 0

        for row in outputs:
            if row['status'] == "failure":
                failure += 1
                average.append(0)

            exec_tdelta = timedelta(seconds=pytimeparse.parse(row['execution_search_candidate']))
            average.append(exec_tdelta.total_seconds())

            self.results['objects'][row['alias']] = row

        t1 = datetime.now()
        tdelta = t1 - t0

        if len(average) > 0:
            maverage = mean(average)

        self.results['search_candidate_report'] = dict({
            'start_time': t0.replace(microsecond=0).isoformat(' '),
            'finish_time': t1.replace(microsecond=0).isoformat(' '),
            'execution_time': str(tdelta),
            'count_asteroids': count,
            'count_success': count - failure,
            'count_failed': failure,
            'average_time': maverage,
        })

        self.logger.info(
            "Finished to generate the table with the candidate stars, %s asteroids in %s" % (
                count, humanize.naturaldelta(tdelta)))

    def praia_occ_input_file(self, obj):

        # TODO: Precisa de um refactoring, os parametros podem vir da interface.
        try:

            input_file = os.path.join(obj['relative_path'], "praia_occ_star_search_12.dat")

            with open("predict/praia_occ_input_template.txt") as file:

                data = file.read()

                name = "/data/%s" % obj['inputs']['catalog']
                data = data.replace('{stellar_catalog}', name.ljust(50))

                name = "/data/%s" % obj['inputs']['ephemeris']
                data = data.replace('{object_ephemeris}', name.ljust(50))

                name = "/data/%s" % self.stars_catalog_mini
                data = data.replace('{stars_catalog_mini}', name.ljust(50))

                name = "/data/%s" % self.stars_catalog_xy
                data = data.replace('{stars_catalog_xy}', name.ljust(50))

                name = "/data/%s" % self.stars_parameters_of_occultation
                data = data.replace('{stars_parameters_of_occultation}', name.ljust(50))

                name = "/data/%s" % self.stars_parameters_of_occultation_plot
                data = data.replace('{stars_parameters_of_occultation_plot}', name.ljust(50))

                with open(input_file, 'w') as new_file:
                    new_file.write(data)

            return input_file


        except Exception as e:
            self.logger.error(e)
            raise (e)

    def run_search_candidate_stars(self, data_path, input_file):
        """
            Cria uma instancia do container PRAIA_Occultation
            e executa o comando search_candidate_stars.py
        :param input_file:
        :return:
        """

        t0 = datetime.now()
        self.logger.info("Generating candidate start tables")

        # Get docker Client Instance
        self.logger.debug("Getting docker client")
        docker_client = docker.DockerClient(
            base_url=settings.DOCKER_HOST)

        # Recupera a Imagem Docker
        docker_image = self.get_docker_image(
            docker_client=docker_client,
            image_name="linea/praiaoccultation:latest")

        # Path absoluto para o diretorio de dados que sera montado no container.
        absolute_archive_path = settings.HOST_ARCHIVE_DIR
        absolute_data_path = os.path.join(absolute_archive_path, data_path.strip('/'))
        self.logger.debug("Absolute Data Path: %s" % absolute_data_path)

        # Comando que sera executado dentro do container.
        cmd = "python search_candidate_stars.py %s" % ("/data/%s" % input_file)
        self.logger.debug("CMD: %s" % cmd)

        # Definicao do Volume /data
        volumes = dict({
            absolute_data_path: dict({
                'bind': '/data',
                'mode': 'rw'
            })
        })

        try:
            self.logger.debug("Starting Container")
            container = docker_client.containers.run(
                docker_image,
                command=cmd,
                detach=True,
                # name="search_candidate",
                auto_remove=True,
                # mem_limit='128m',
                volumes=volumes,
                user=os.getuid()
            )

            container.wait()
            self.logger.debug("Finish Container")

            t1 = datetime.now()
            tdelta = t1 - t0

            # dates_file = os.path.join(self.relative_path, )
            if os.path.exists(os.path.join(data_path, self.stars_catalog_mini)) and os.path.exists(
                os.path.join(data_path, self.stars_catalog_xy)) and os.path.exists(
                os.path.join(data_path, self.stars_parameters_of_occultation)) and os.path.exists(
                os.path.join(data_path, self.stars_parameters_of_occultation_plot)):

                return True
            else:
                return False

        except docker.errors.ContainerError as e:
            self.logger.error(e)
            raise e
        except Exception as e:
            self.logger.error(e)
            raise e

    def generate_maps(self):

        self.logger.info("Generating Maps ")

        t0 = datetime.now()

        # Configuracao do Parsl
        try:
            parsl_config = settings.PARSL_CONFIG

            # Diminuindo o numero de Treads por causa da limitacao de memoria
            parsl_config["sites"][0]["execution"]["maxThreads"] = int(settings.MINIMUM_THREADS)

            dfk = DataFlowKernel(
                config=dict(parsl_config))

        except Exception as e:
            self.logger.error(e)
            raise e

        self.logger.info("Configuring Parsl")
        self.logger.debug("Parsl Config:")
        self.logger.debug(settings.PARSL_CONFIG)

        # Configuracao do Parsl Log.
        parsl.set_file_logger(os.path.join(self.relative_path, 'generate_maps_parsl.log'))

        # Declaracao do Parsl APP
        @App("python", dfk)
        def start_parsl_job(id, obj, logger):

            t0 = datetime.now()


            status = 'failure'
            error_msg = 'Maps were not created'

            result = self.run_generate_maps(id, obj)

            if result:
                status = 'success'
                error_msg = None

                # TODO: Criar um resultado para cada MAPA


            t1 = datetime.now()
            tdelta = t1 - t0

            obj["status"] = status
            obj["error_msg"] = error_msg
            obj["start_maps"] = t0.replace(microsecond=0).isoformat(' ')
            obj["finish_maps"] = t1.replace(microsecond=0).isoformat(' ')
            obj["execution_maps"] = str(tdelta)

            if result:
                msg = "[ SUCCESS ] - Object: %s Time: %s " % (
                    obj['name'], humanize.naturaldelta(tdelta))
            else:
                msg = "[ FAILURE ] - Object: %s " % obj['name']

            logger.info(msg)

            return obj

        # executa o app Parsl para cara registro em paralelo
        results = []
        id = 0
        for alias in self.results['objects']:
            obj = self.results['objects'][alias]

            if obj['status'] is not 'failure' and obj['status'] is not 'not_executed':
                result = start_parsl_job(
                    id=id,
                    obj=obj,
                    logger=self.logger)

                self.logger.debug(result)

                results.append(result)

            id += 1

        # Espera o Resultado de todos os jobs.
        outputs = [i.result() for i in results]

        for i in results:
            i.done()

        dfk.cleanup()

        count = len(outputs)
        failure = 0
        average = []
        maverage = 0

        for row in outputs:
            if row['status'] == "failure":
                failure += 1
                average.append(0)

            exec_tdelta = timedelta(seconds=pytimeparse.parse(row['execution_maps']))
            average.append(exec_tdelta.total_seconds())

            self.results['objects'][row['alias']] = row

        t1 = datetime.now()
        tdelta = t1 - t0

        if len(average) > 0:
            maverage = mean(average)

        self.results['maps_report'] = dict({
            'start_time': t0.replace(microsecond=0).isoformat(' '),
            'finish_time': t1.replace(microsecond=0).isoformat(' '),
            'execution_time': str(tdelta),
            'count_asteroids': count,
            'count_success': count - failure,
            'count_failed': failure,
            'average_time': maverage,
        })

        self.logger.info(
            "Finished to generate maps, %s asteroids in %s" % (
                count, humanize.naturaldelta(tdelta)))

    def run_generate_maps(self, id, obj):
        """
            Cria uma instancia do container PRAIA_Occultation
            e executa o comando generate_maps.py
        :param Objeto:
        :return:
        """
        self.logger.info("Generating Maps")

        data_path = obj['relative_path']

        # Get docker Client Instance
        self.logger.debug("Getting docker client")
        docker_client = docker.DockerClient(
            base_url=settings.DOCKER_HOST)

        # Recupera a Imagem Docker
        docker_image = self.get_docker_image(
            docker_client=docker_client,
            image_name="linea/praiaoccultation:latest")

        # Path absoluto para o diretorio de dados que sera montado no container.
        absolute_archive_path = settings.HOST_ARCHIVE_DIR
        absolute_data_path = os.path.join(absolute_archive_path, data_path.strip('/'))
        self.logger.debug("Absolute Data Path: %s" % absolute_data_path)

        # Comando que sera executado dentro do container.
        cmd = "python generate_maps.py %s %s %s" % (
            obj['alias'].replace('_', ''),
            obj['diameter'],
            obj['results']['stars_parameters_of_occultation_plot']['filename']
        )
        self.logger.debug("CMD: %s" % cmd)

        # Definicao do Volume /data
        volumes = dict({
            absolute_data_path: dict({
                'bind': '/data',
                'mode': 'rw'
            })
        })

        try:
            self.logger.debug("[ %s ] Starting Container" % id)
            container = docker_client.containers.run(
                docker_image,
                command=cmd,
                detach=True,
                auto_remove=True,
                mem_limit='4096m',
                # mem_limit='2096m',
                volumes=volumes,
                user=os.getuid()
            )

            container.wait()
            self.logger.debug("[ %s ] Finish Container" % id)

            return self.check_map_results(obj)

        except docker.errors.ContainerError as e:
            self.logger.error(e)
            raise e
        except Exception as e:
            self.logger.error(e)
            raise e

    def check_map_results(self, obj):
        # TODO Criar uma funcao para verificar se os mapas foram criados corretamente,
        # Precisa saber quantos mapas e qual o nome dos mapas que deveriam ter sido criados.
        return True


    def register_asteroid(self, obj, predict_run):

        self.logger.debug("Registered Object")

        try:

            self.logger.debug("Object Status [%s]" % obj.get("status"))

            if obj.get("status") is 'not_executed':
                asteroid, created = PredictAsteroid.objects.update_or_create(
                    predict_run=predict_run,
                    name=obj.get("name"),
                    defaults={
                        'number': obj.get("number"),
                        'status': 'not_executed',
                        'error_msg': 'Not executed because it failed to refine orbit.',
                    })

                asteroid.save()

            else:

                # Gerar o tempo medio para executar cada asteroid somando o tempo de cada etapa
                t1 = pytimeparse.parse(obj.get("execution_ephemeris", "00:00:00"))
                t2 = pytimeparse.parse(obj.get("execution_gaia_catalog", "00:00:00"))
                t3 = pytimeparse.parse(obj.get("execution_search_candidate", "00:00:00"))
                t4 = pytimeparse.parse(obj.get("execution_maps", "00:00:00"))
                ttotal = (t1 + t2) + (t3 + t4)

                self.execution_time.append(ttotal)

                texecution = timedelta(seconds=ttotal)
                # Fix for prevent invalid input syntax for type interval: "None"
                if texecution:
                    texecution = str(texecution)

                execution_ephemeris = None
                if obj.get("execution_ephemeris"):
                    execution_ephemeris = str(obj.get("execution_ephemeris"))

                execution_gaia_catalog = None
                if obj.get("execution_gaia_catalog"):
                    execution_gaia_catalog = str(obj.get("execution_gaia_catalog"))

                execution_search_candidate = None
                if obj.get("execution_search_candidate"):
                    execution_search_candidate = str(obj.get("execution_search_candidate"))

                asteroid, created = PredictAsteroid.objects.update_or_create(
                    predict_run=predict_run,
                    name=obj.get("name"),
                    defaults={
                        'number': obj.get("number"),
                        'diameter': obj.get("diameter"),
                        'status': obj.get("status"),
                        'error_msg': obj.get("error_msg"),
                        'catalog_rows': obj.get("gaia_rows"),
                        'execution_time': texecution,
                        "start_ephemeris": obj.get("start_ephemeris"),
                        "finish_ephemeris": obj.get("finish_ephemeris"),
                        "execution_ephemeris": obj.get("execution_ephemeris"),
                        "start_catalog": obj.get("start_gaia_catalog"),
                        "finish_catalog": obj.get("finish_gaia_catalog"),
                        "execution_catalog": execution_gaia_catalog,
                        "start_search_candidate": obj.get("start_search_candidate"),
                        "finish_search_candidate": obj.get("finish_search_candidate"),
                        "execution_search_candidate": execution_search_candidate,
                        "start_maps": obj.get("start_maps"),
                        "finish_maps": obj.get("finish_maps"),
                        "execution_maps": obj.get("execution_maps"),
                        'relative_path': obj.get("relative_path"),
                    })

                asteroid.save()

                l_created = "Created"

                # Apaga todas os resultados  e os inputs caso seja um update
                if not created:
                    l_created = "Updated"

                    for result_file in asteroid.predict_result.all():
                        result_file.delete()

                    for obj_input in asteroid.input_file.all():
                        obj_input.delete()

                    for occ in asteroid.occultation.all():
                        occ.delete()

                for ftype in obj.get("results"):
                    result = obj.get("results").get(ftype)
                    if result is not None:
                        result_file, created = PredictOutput.objects.update_or_create(
                            asteroid=asteroid,
                            filename=result.get("filename"),
                            type=ftype,
                            defaults={
                                'file_size': result.get("file_size"),
                                'file_type': result.get("file_type"),
                                'file_path': result.get("file_path"),
                            }
                        )

                        result_file.save()

                # Registra os Inputs Utilizados
                for input_type in obj.get("inputs"):
                    inp = obj.get("inputs").get(input_type)

                    if inp is not None:
                        file_path = os.path.join(obj['relative_path'], inp)
                        file_size = None
                        file_type = None
                        if os.path.exists(file_path):
                            file_size = os.path.getsize(file_path)
                            file_type = os.path.splitext(file_path)[1]

                        input_file, created = PredictInput.objects.update_or_create(
                            asteroid=asteroid,
                            input_type=input_type,
                            defaults={
                                'filename': inp,
                                'file_path': file_path,
                                'file_size': file_size,
                                'file_type': file_type
                            },
                        )

                        input_file.save()

                # Registrar as Ocultacoes
                if obj['results']['occultation_table'] is not None:
                    table = obj['results']['occultation_table']['file_path']
                    self.logger.debug("Table Path: %s" % table)

                    with open(table) as csvfile:
                        fieldnames = [
                            'occultation_date', 'ra_star_candidate', 'dec_star_candidate','ra_object', 'dec_object', 
                            'ca', 'pa', 'vel', 'delta', 'g', 'j', 'h', 'k', 'long', 'loc_t', 'off_ra', 'off_de', 
                            'pm', 'ct', 'f', 'e_ra', 'e_de', 'pmra', 'pmde']

                        reader = csv.DictReader(csvfile, fieldnames=fieldnames, delimiter=';', skipinitialspace=True)

                        next(reader, None)

                        for row in reader:

                            dt = datetime.strptime(row['occultation_date'], '%Y-%m-%d %H:%M:%S')

                            file_map = "%s_%s.000.png" % (obj['alias'].replace('_', ''), dt.isoformat())
                            map_path = os.path.join(obj['relative_path'], file_map)

                            if not os.path.exists(map_path):
                                map_path = None

                            occ, created = Occultation.objects.update_or_create(
                                asteroid=asteroid,
                                date_time=row['occultation_date'],
                                defaults={
                                    'ra_star_candidate': row['ra_star_candidate'],
                                    'dec_star_candidate': row['dec_star_candidate'],
                                    'ra_target': row['ra_object'],
                                    'dec_target': row['dec_object'],
                                    'closest_approach': row['ca'],
                                    'position_angle': row['pa'],
                                    'velocity': row['vel'],
                                    'delta': row['delta'],
                                    'g': row['g'],
                                    'j': row['j'],
                                    'h': row['h'],
                                    'k': row['k'],
                                    'long': row['long'],
                                    'loc_t': row['loc_t'],
                                    'off_ra': row['off_ra'],
                                    'off_dec': row['off_de'],
                                    'proper_motion': row['pm'],
                                    'ct': row['ct'],
                                    'multiplicity_flag': row['f'],
                                    'e_ra': row['e_ra'],
                                    'e_dec': row['e_de'],
                                    'pmra': row['pmra'],
                                    'pmdec': row['pmde'],
                                    'file_path': map_path
                                }
                            )
                            occ.save()

                # Mudar o Status do Asteroid caso nao tenha gerado todos os mapas
                # Basta contar quantos ocultacoes estao com o campo file_path em branco.
                if asteroid.occultation.filter(file_path__isnull=True).count() > 0:
                    asteroid.status = "warning"
                    asteroid.save()


            self.logger.info("Registered Object %s " % obj.get("name"))

        except Exception as e:
            self.logger.error("Failed to Register Object %s Error: %s" % (obj.get("name"), e))
            asteroid, created = PredictAsteroid.objects.update_or_create(
                predict_run=predict_run,
                name=obj.get("name"),
                defaults={
                    'number': obj.get("number"),
                    'status': 'failure',
                    'error_msg': 'Failed to record results. error: %s' % e,
                })

            asteroid.save()


    def on_error(self, msg):
        pass



# Comando para gerar o plot no gnuplot
# plot 'gaia.csv' u 1:2 notitle, '1999RB216.eph' u (15*($3+$4/60+$5/3600)):(($6+$7/60+$8/3600)) w l notitle
