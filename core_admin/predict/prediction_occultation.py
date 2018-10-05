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


class PredictionOccultation():
    def __init__(self):
        self.logger = logging.getLogger("predict_occultation")

        self.archive_dir = settings.ARCHIVE_DIR
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
            "count_objects": 0,
            "count_executed": 0,
            "count_not_executed": 0,
            "count_success": 0,
            "count_failed": 0,
            "count_warning": 0,
            "average_time": 0,
            "objects_dir": None,
            "input_list": None,
            "proccess": None,
            "objects": dict(),
            "dates_file_report": dict(),
            "ephemeris_report": dict()
        })

        self.leap_second = None
        self.dates_file = None

    def start_predict_occultation(self, instance):
        self.logger.debug("PREDICT RUN: %s" % instance.id)

        start_time = datetime.now()
        self.results["start_time"] = start_time.replace(microsecond=0).isoformat(' ')

        # Recuperar a Instancia do processo
        self.proccess = instance.proccess
        self.results["proccess"] = self.proccess.id

        self.logger.debug("PROCCESS: %s" % self.proccess.id)
        self.logger.debug("PROCCESS DIR: %s" % self.proccess.relative_path)

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

        try:

            instance = self.create_directory(instance)

            # 1 - Leap Seconds -----------------------------------------------------------------------------------------
            self.leap_second = self.copy_leap_seconds_file(instance)

            # 2 - Generate Dates ---------------------------------------------------------------------------------------

            # TODO esses parametros devem vir da interface
            start_date = "2018-JAN-01"
            end_date = "2018-DEC-31 23:59:01"
            step = 600

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

                self.results["objects"][obj_name] = dict({
                    "name": obj.get("name"),
                    "number": obj.get("num"),
                    "alias": obj_name,
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
                        "bsp_asteroid": '%s.bsp' % obj_name.replace('_', ''),
                        "leap_second": leap_second,
                        "positions": None
                    }),
                    "results": list()
                })

            # 5 - Generate Ephemeris -----------------------------------------------------------------------------------

            self.results["objects"] = self.generate_ephemeris()


            # 6 - Generate Catalog Gaia --------------------------------------------------------------------------------
            self.generate_gaia_catalog()


            self.logger.debug(json.dumps(self.results))

        except Exception as e:
            self.logger.error(e)
            self.logger.error("Failed to execute prediction occultation")
            # TODO chamar uma funcao para alterar o status para error.

    def create_directory(self, instance):

        proccess = instance.proccess
        # Criar um diretorio para a Predicao de Occultacao
        directory_name = "prediction_occultation_%s" % instance.id
        directory = os.path.join(proccess.relative_path, directory_name)

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
            image_name="praia-occultation:latest")

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
            image_name="praia-occultation:latest")

        # executa o app Parsl para cara registro em paralelo
        results = []
        id = 0
        for alias in self.results['objects']:
            obj = self.results['objects'][alias]

            self.logger.debug("Running for object %s" % obj["name"])

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

        return outputs

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
                obj["results"].append(dict({
                    "filename": filename,
                    "file_size": os.path.getsize(ephemeris),
                    "file_path": ephemeris,
                    "file_type": os.path.splitext(ephemeris)[1]
                }))

                # Result RADEC
                obj["results"].append(dict({
                    "filename": radec_filename,
                    "file_size": os.path.getsize(radec),
                    "file_path": radec,
                    "file_type": os.path.splitext(radec)[1]
                }))

                # Result Positions
                obj["results"].append(dict({
                    "filename": positions_filename,
                    "file_size": os.path.getsize(positions),
                    "file_path": positions,
                    "file_type": os.path.splitext(positions)[1]
                }))

                # Positions e input para a proxima etapa
                obj["inputs"]["positions"] = positions_filename

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
        def start_parsl_job(id, catalog, obj, logger):

            logger.debug("TESTE: %s" % obj['name'])

            return None


        # Retrive Gaia catalog
        gaia = None

        # executa o app Parsl para cara registro em paralelo
        results = []
        id = 0
        for alias in self.results['objects']:
            obj = self.results['objects'][alias]

            self.logger.debug("Running for object %s" % obj["name"])


            self.results["objects"][alias]["status"] = "running"

            result = start_parsl_job(
                id=id,
                catalog=gaia,
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



    def run_gaia_catalog(self, catalog ):
        pass

    def on_error(self, msg):
        pass
