import logging
from datetime import datetime
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
from .models import PredictAsteroid

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
            "register_report": dict()
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

    def start_predict_occultation(self, instance):
        self.logger.debug("PREDICT RUN: %s" % instance.id)

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
        instance.save()
        self.logger.info("Status changed to Running")

        try:

            instance = self.create_directory(instance)

            # 1 - Leap Seconds -----------------------------------------------------------------------------------------
            self.leap_second = self.copy_leap_seconds_file(instance)

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

            # 3 - BSP Planetary ----------------------------------------------------------------------------------------
            self.bsp_planetary = self.copy_bsp_planetary(instance)

            # 4 - Objetos ----------------------------------------------------------------------------------------------

            # Recuperando os Objetos
            objects, obj_count = ProccessManager().get_objects(tablename=self.input_list.tablename,
                                                               schema=self.input_list.schema)

            self.results["count_objects"] = obj_count

            self.logger.debug("Objects: %s" % obj_count)

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
                bsp_nima_name = '%s_%s_nima.bsp' % (obj.get("num"), obj_name.replace('_', ''))
                if os.path.exists(os.path.join(obj_relative_path, bsp_nima_name)):
                    os.rename(
                        os.path.join(obj_relative_path, bsp_nima_name),
                        os.path.join(obj_relative_path, bsp_name))

                # TODO atributo shade_diameter esta hardcoded e necessario um codigo para extrair esse atributo de um site

                self.results["objects"][obj_name] = dict({
                    "name": obj.get("name"),
                    "number": obj.get("num"),
                    "alias": obj_name,
                    "shade_diameter": 147,
                    "relative_path": obj_relative_path,
                    "status": None,
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
                        "gaia_catalog": None,
                        "praia_occ_data": None
                    }),
                    "results": dict({
                        "ephemeris": None,
                        "radec": None,
                        "positions": None,
                        "gaia_catalog": None,
                        "stars_catalog_mini": None,
                        "stars_catalog_xy": None,
                        "stars_parameters_of_occultation": None,
                        "stars_parameters_of_occultation_plot": None
                    })
                })

            # 5 - Generate Ephemeris -----------------------------------------------------------------------------------
            self.generate_ephemeris()

            # 6 - Generate Catalog Gaia --------------------------------------------------------------------------------
            self.generate_gaia_catalog()

            # 7 - Run PRAIA OCC Star Search 12 -------------------------------------------------------------------------
            self.search_candidate_stars()

            # 8 - Generate Maps ----------------------------------------------------------------------------------------
            self.generate_maps()


            self.logger.debug(json.dumps(self.results))


            # ---------------------- Recording the results. ----------------------------------------------------------------

            t_register_0 = datetime.now()
            # Iterate over objects
            for alias in self.results["objects"]:
                obj = self.results["objects"][alias]

                # TODO: Registrar os Asteroids e o Resultado.
                self.register_asteroid(obj, instance)

            t_register_1 = datetime.now()
            t_register_delta = t_register_1 - t_register_0

            self.results["execution_register_time"] = t_register_delta.total_seconds()


        except Exception as e:
            self.logger.error(e)
            self.logger.error("Failed to execute prediction occultation")
            # TODO chamar uma funcao para alterar o status para error.

    def create_directory(self, instance):

        process = instance.process
        # Criar um diretorio para a Predicao de Occultacao
        directory_name = "prediction_occultation_%s" % instance.id
        directory = os.path.join(process.relative_path, directory_name)

        try:
            # Criar o Diretorio
            os.makedirs(directory)

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
                name="occultation_dates",
                auto_remove=True,
                mem_limit='128m',
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
                    'execution_time': tdelta.total_seconds(),
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

        for row in outputs:
            if row['status'] == "failure":
                failure += 1
            average.append(row['execution_ephemeris'])

            self.results['objects'][row['alias']] = row

        self.results['ephemeris_report'] = dict({
            'start_time': t0.replace(microsecond=0).isoformat(' '),
            'finish_time': t1.replace(microsecond=0).isoformat(' '),
            'execution_time': tdelta.total_seconds(),
            'count_asteroids': count,
            'count_success': count - failure,
            'count_failed': failure,
            'average_time': mean(average)
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
                name=container_name,
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
            obj["execution_ephemeris"] = tdelta.total_seconds()

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

            t1 = datetime.now()
            tdelta = t1 - t0

            # Result Catalog Gaia
            obj["results"]["gaia_catalog"] = dict({
                "filename": os.path.basename(filename),
                "file_size": file_size,
                "file_path": filename,
                "file_type": os.path.splitext(filename)[1]
            })

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
            obj["inputs"]["gaia_catalog"] = os.path.basename(filename)

            obj["status"] = status
            obj["error_msg"] = error_msg
            obj["start_gaia_catalog"] = t0.replace(microsecond=0).isoformat(' ')
            obj["finish_gaia_catalog"] = t1.replace(microsecond=0).isoformat(' ')
            obj["execution_gaia_catalog"] = tdelta.total_seconds()
            obj["gaia_rows"] = crows

            return obj

        # Retrive Gaia catalog
        gaia = self.catalog

        # executa o app Parsl para cara registro em paralelo
        results = []
        id = 0
        for alias in self.results['objects']:
            obj = self.results['objects'][alias]

            self.results["objects"][alias]["status"] = "running"

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
        for row in outputs:
            if row['status'] == "failure":
                failure += 1
            average.append(row['execution_gaia_catalog'])
            crows.append(row['gaia_rows'])

            self.results['objects'][row['alias']] = row

        t1 = datetime.now()
        tdelta = t1 - t0

        self.results['gaia_catalog_report'] = dict({
            'start_time': t0.replace(microsecond=0).isoformat(' '),
            'finish_time': t1.replace(microsecond=0).isoformat(' '),
            'execution_time': tdelta.total_seconds(),
            'count_asteroids': count,
            'count_success': count - failure,
            'count_failed': failure,
            'average_time': mean(average),
            'average_rows': mean(crows)
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

            clauses = []
            for pos in positions:
                clauses.append(
                    'q3c_radial_query("%s", "%s", % s, % s, % s)' % (
                        catalog.ra_property, catalog.dec_property, pos[0], pos[1], radius))

            where = ' OR '.join(clauses)

            stm = """SELECT %s FROM %s WHERE %s LIMIT 20000""" % (columns, tablename, where)

            rows = db.fetch_all_dict(text(stm))

            return rows

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

            logger.info("TESTE parsl")

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


            t1 = datetime.now()
            tdelta = t1 - t0

            obj["status"] = status
            obj["error_msg"] = error_msg
            obj["start_search_candidate"] = t0.replace(microsecond=0).isoformat(' ')
            obj["finish_search_candidate"] = t1.replace(microsecond=0).isoformat(' ')
            obj["execution_search_candidate"] = tdelta.total_seconds()

            return obj

        # executa o app Parsl para cara registro em paralelo
        results = []
        id = 0
        for alias in self.results['objects']:
            obj = self.results['objects'][alias]

            self.results["objects"][alias]["status"] = "running"

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
        for row in outputs:
            if row['status'] == "failure":
                failure += 1
            average.append(row['execution_search_candidate'])

            self.results['objects'][row['alias']] = row

        t1 = datetime.now()
        tdelta = t1 - t0

        self.results['search_candidate_report'] = dict({
            'start_time': t0.replace(microsecond=0).isoformat(' '),
            'finish_time': t1.replace(microsecond=0).isoformat(' '),
            'execution_time': tdelta.total_seconds(),
            'count_asteroids': count,
            'count_success': count - failure,
            'count_failed': failure,
            'average_time': mean(average),
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

                name = "/data/%s" % obj['inputs']['gaia_catalog']
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
                name="search_candidate",
                auto_remove=True,
                mem_limit='128m',
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
            dfk = DataFlowKernel(
                config=dict(settings.PARSL_CONFIG))

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
                status = 'running'
                error_msg = None

                # TODO: Criar um resultado para cada MAPA


            t1 = datetime.now()
            tdelta = t1 - t0

            obj["status"] = status
            obj["error_msg"] = error_msg
            obj["start_maps"] = t0.replace(microsecond=0).isoformat(' ')
            obj["finish_maps"] = t1.replace(microsecond=0).isoformat(' ')
            obj["execution_maps"] = tdelta.total_seconds()

            if result:
                msg = "[ SUCCESS ] - Object: %s Time: %s " % (
                    obj['name'], humanize.naturaldelta(obj['execution_maps']))
            else:
                msg = "[ FAILURE ] - Object: %s " % obj['name']

            logger.debug(msg)

            return obj

        # executa o app Parsl para cara registro em paralelo
        results = []
        id = 0
        for alias in self.results['objects']:
            obj = self.results['objects'][alias]

            self.results["objects"][alias]["status"] = "running"

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
        for row in outputs:
            if row['status'] == "failure":
                failure += 1
            average.append(row['execution_maps'])

            self.results['objects'][row['alias']] = row

        t1 = datetime.now()
        tdelta = t1 - t0

        self.results['maps_report'] = dict({
            'start_time': t0.replace(microsecond=0).isoformat(' '),
            'finish_time': t1.replace(microsecond=0).isoformat(' '),
            'execution_time': tdelta.total_seconds(),
            'count_asteroids': count,
            'count_success': count - failure,
            'count_failed': failure,
            'average_time': mean(average),
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
            obj['shade_diameter'],
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

        container_name = "occultation_maps_%s" % id

        try:
            self.logger.debug("[ %s ] Starting Container" % container_name)
            container = docker_client.containers.run(
                docker_image,
                command=cmd,
                detach=True,
                name=container_name,
                auto_remove=True,
                mem_limit='4096m',
                volumes=volumes,
                user=os.getuid()
            )

            container.wait()
            self.logger.debug("[ %s ] Finish Container" % container_name)

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

        try:

            # try:
            #     t0 = datetime.strptime(obj.get("start_time"), '%Y-%m-%d %H:%M:%S')
            #
            # except:
            #     t0 = None
            # try:
            #     t1 = datetime.strptime(obj.get("finish_time"), '%Y-%m-%d %H:%M:%S')
            # except:
            #     t1 = None
            #
            # if t0 is not None and t1 is not None:
            #     t_delta = t1 - t0
            # else:
            #     t_delta = None

            asteroid, created = PredictAsteroid.objects.update_or_create(
                predict_run=predict_run,
                name=obj.get("name"),
                defaults={
                    'number': obj.get("number"),
                    'status': obj.get("status"),
                    'error_msg': obj.get("error_msg"),
                    # 'start_time': t0,
                    # 'finish_time': t1,
                    # 'execution_time': t_delta,
                    'relative_path': obj.get("relative_path"),
                    'absolute_path': obj.get("absolute_path")
                })

            asteroid.save()

            l_created = "Created"

            # # Apaga todas os resultados caso seja um update
            # if not created:
            #     l_created = "Updated"
            #
            #     for orbit in asteroid.refined_orbit.all():
            #         orbit.delete()
            #
            # for f in obj.get("results"):
            #     orbit, created = PredictAsteroid.objects.update_or_create(
            #         asteroid=asteroid,
            #         filename=f.get("filename"),
            #         defaults={
            #             'file_size': f.get("file_size"),
            #             'file_type': f.get("file_type"),
            #             'relative_path': f.get("file_path"),
            #         }
            #     )
            #
            #     orbit.save()

            # # Registra os Inputs Utilizados
            # for input_type in obj.get("inputs"):
            #     inp = obj.get("inputs").get(input_type)
            #
            #     if inp is not None:
            #         input_file, created = RefinedOrbitInput.objects.update_or_create(
            #             asteroid=asteroid,
            #             input_type=input_type,
            #             defaults={
            #                 'source': inp.get("source"),
            #                 'date_time': inp.get("date_time"),
            #                 'filename': inp.get("filename"),
            #                 'relative_path': inp.get("file_path"),
            #             }
            #         )
            #
            #         input_file.save()

            self.logger.info("Registered Object %s %s" % (obj.get("name"), l_created))

        except Exception as e:
            self.logger.error("Failed to Register Object %s Error: %s" % (obj.get("name"), e))


    def on_error(self, msg):
        pass



# Comando para gerar o plot no gnuplot
# plot 'gaia.csv' u 1:2 notitle, '1999RB216.eph' u (15*($3+$4/60+$5/3600)):(($6+$7/60+$8/3600)) w l notitle
