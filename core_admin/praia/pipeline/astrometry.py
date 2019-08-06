from tno.models import Proccess
import os
import stat
import errno
import logging
from random import randrange
import time
import humanize
from datetime import datetime, timezone, timedelta
from tno.db import DBBase, CatalogDB
from tno.skybotoutput import FilterObjects
from tno.proccess import ProccessManager
from django.conf import settings
import shutil
import csv
import traceback
from concurrent.futures import ThreadPoolExecutor, wait, as_completed
from orbit.bsp_jpl import BSPJPL
from praia.models import Run, AstrometryAsteroid, AstrometryInput
import requests
import json

from praia.pipeline.ccd_image import create_ccd_images_list
from praia.pipeline.bsp_jpl import retrieve_bsp_jpl
from praia.pipeline.star_catalog import create_star_catalog

from praia.pipeline.register import register_condor_job


class AstrometryPipeline():
    def __init__(self):
        self.logger = logging.getLogger("astrometry")

        self.proccess = None
        self.input_list = None
        self.objects_dir = None
        self.instance = None
        self.asteroid = []

        # TODO: este diretorio e provisorio para simular a execucao do PRAIA
        self.astrometry_positions_dir = settings.ASTROMETRY_POSITIONS_DIR

    def initialize_model_run(self, run_id):
        instance = Run.objects.get(pk=run_id)

        instance.status = 'running'
        instance.start_time = datetime.now(timezone.utc)
        instance.finish_time = None
        instance.execution_time = None
        instance.count_objects = None
        instance.count_success = None
        instance.count_failed = None
        instance.count_warning = None
        instance.count_not_executed = None
        instance.execution_ccd_images = None
        instance.execution_bsp_jpl = None
        instance.execution_catalog = None
        instance.step = 0
        instance.error_msg = None
        instance.error_traceback = None

        instance.save()

        self.instance = instance

        return instance

    def startAstrometryRun(self, run_id):

        instance = self.initialize_model_run(run_id)

        self.logger.info("Status changed to Running")

        self.logger.info("PRAIA RUN %s" % instance.id)

        self.logger.debug("Input List: %s" % instance.input_list.id)

        self.input_list = instance.input_list

        # No caso de uma re execucao o processo ja existe
        if instance.proccess is None:
            # Como a Astrometria e a primeira etapa ela fica responsavel por iniciar o processo.
            self.logger.info("Creating a Process")

            try:

                proccess = Proccess.objects.create(
                    owner=instance.owner,
                    input_list=instance.input_list
                )

                proccess.save()
                self.logger.info(
                    "Process Created with ID [ %s ]" % proccess.id)

                instance.proccess = proccess
                instance.save()

            except Exception as e:
                self.on_error(self.instance, e)

        self.proccess = instance.proccess

        # TODO Confirmar o por que o diretorio de astrometria informa ser criado mas as vezes nao e.
        # Esperar o diretorio de processo ser criado.
        time.sleep(2)

        # Diretorio onde ficam os inputs e resultados separados por objetos.
        self.objects_dir = os.path.join(self.proccess.relative_path, "objects")

        # Criar um diretorio para os arquivos do PRAIA.
        try:
            directory_name = "astrometry_%s" % instance.id
            directory = os.path.join(
                self.proccess.relative_path, directory_name)
        except Exception as e:
            self.on_error(instance, e)

        try:
            # Criar o Diretorio
            os.makedirs(directory)

            time.sleep(2)

            if os.path.exists(directory):
                # Alterar a Permissao do Diretorio
                os.chmod(directory, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO)

                self.logger.info("Astrometry directory created")
                self.logger.debug("Directory: %s" % directory)

                instance.relative_path = directory
                instance.save()
            else:
                instance.status = 'error'
                instance.save()
                msg = "Failed to create astrometry directory [ %s ]" % directory
                self.logger.error(msg)
                raise Exception(msg)

        except OSError as e:
            msg = "Failed to create astrometry directory [ %s ]" % directory
            instance.status = 'error'
            instance.error_msg = msg
            instance.save()
            self.logger.error(msg)
            if e.errno != errno.EEXIST:
                self.on_error(instance, e)

        # Log no diretorio de execucao
        handler = logging.FileHandler(
            os.path.join(directory, 'astrometry.log'))
        self.logger.addHandler(handler)

        # Registro dos asteroids
        self.logger.info("Register Objects")

        # Recuperando os Objetos
        objects, obj_count = ProccessManager().get_objects(tablename=self.input_list.tablename,
                                                           schema=self.input_list.schema)
        self.logger.debug("Objects: %s" % obj_count)

        # Guarda a quantidade de objetos recebido como input
        instance.count_objects = obj_count
        instance.save()

        for obj in objects:
            self.logger.debug("Register Object: %s" % obj.get("name"))
            try:

                obj_alias = obj.get("name").replace(" ", "_")
                obj_relative_path = os.path.join(self.objects_dir, obj_alias)

                try:
                    if not os.path.exists(obj_relative_path):
                        os.makedirs(obj_relative_path)
                        time.sleep(2)
                    os.chmod(obj_relative_path, stat.S_IRWXU |
                             stat.S_IRWXG | stat.S_IRWXO)
                except OSError as e:
                    msg = "Failed to create Asteroid directory [ %s ]" % obj_relative_path
                    self.logger.error(msg)
                    self.on_error(instance, e)

                asteroidModel, created = AstrometryAsteroid.objects.update_or_create(
                    astrometry_run=instance,
                    name=obj.get("name"),
                    defaults={
                        'number': obj.get("num"),
                        'status': "pending",
                        'relative_path': obj_relative_path,
                    })

                asteroidModel.save()

            except Exception as e:
                self.on_error(instance, e)

        # Lista com os Models referentes aos objetos.
        self.asteroids = AstrometryAsteroid.objects.filter(
            astrometry_run=instance.pk)

        self.logger.info(
            "Register Objects. Asteroids Count: [%s]" % self.asteroids.count())

        # ===================================================================================================
        # CCD Images - List all ccd for every asteroid
        # ===================================================================================================
        self.logger.info(
            "---------------------------------// CCD Images //---------------------------------")

        ccd_images_start = datetime.now(timezone.utc)

        pool = ThreadPoolExecutor(max_workers=4)
        futures = []
        idx = 1
        try:

            for obj in self.asteroids:
                obj.status = 'running'
                obj.save()

                self.logger.info(
                    "Running CCD Images [ %s / %s ] Object: [ %s ]" % (idx, obj_count, obj.name))

                obj_dir = obj.relative_path

                # CCD Images
                ccd_images_file = os.path.join(obj_dir, "ccd_images.csv")

                self.logger.debug("CCD Images CSV: [ %s ]" % ccd_images_file)

                futures.append(pool.submit(
                    create_ccd_images_list, instance.pk, obj.name, ccd_images_file))

                idx += 1

            # Esperar todas as execucoes.
            wait(futures)

            results = []
            for future in futures:
                results.append(future.result())

            for result in results:
                # Registar a quantidade de CCDs para cada Asteroid
                asteroid = self.asteroids.get(name=result['asteroid'])

                if result["ccds_count"] is None or result["ccds_count"] == 0:
                    # Asteroid nao tem CCD image associada a ele, marcar como falha.
                    asteroid.status = 'not_executed'
                    asteroid.error_msg = result['error_msg']
                    asteroid.save()
                    self.logger.warning(
                        "Asteroid [ %s ] - %s" % (asteroid.name, asteroid.error_msg))
                else:
                    asteroid.status = 'running'
                    asteroid.ccd_images = result['ccds_count']

                    self.logger.info("Registered %s Input for Asteroid [ %s ] File: [%s] " % (
                        result['input_type'], asteroid.name, result['file_path']))

                asteroid.execution_time = result['execution_time']
                asteroid.save()

        except Exception as e:
            self.on_error(instance, e)

        ccd_images_finish = datetime.now(timezone.utc)
        ccd_images_execution_time = ccd_images_finish - ccd_images_start

        self.logger.info("Finished CCD Images list in %s" %
                         humanize.naturaldelta(ccd_images_execution_time))

        instance.execution_ccd_images = ccd_images_execution_time 
        
        # ===================================================================================================
        # BSP JPL - Retrieve BSP JPL  for every asteroid
        # ===================================================================================================
        self.logger.info(
            "---------------------------------// BSP JPL //---------------------------------")
        instance.step = 1
        instance.save()

        bsp_jpl_start = datetime.now(timezone.utc)

        # Reload na lista de asteroids agora sem os que falharam na etapa anterior.
        self.asteroids = AstrometryAsteroid.objects.filter(
            astrometry_run=instance.pk).exclude(status__in=list(['failure', 'not_executed']))

        pool = ThreadPoolExecutor(max_workers=4)
        futures = []
        idx = 1

        try:
            for obj in self.asteroids:
                self.logger.info(
                    "Running BSP JPL [ %s / %s ] Object: [ %s ]" % (idx, self.asteroids.count(), obj.name))

                obj.status = 'running'
                obj.save()

                # BSP JPL
                futures.append(pool.submit(retrieve_bsp_jpl, run_id,
                                           obj.name, obj.relative_path))

                idx += 1

            # Esperar todas as execucoes.
            wait(futures)

            results = []
            for future in futures:
                results.append(future.result())

            for result in results:
                # Registar a quantidade de CCDs para cada Asteroid
                asteroid = self.asteroids.get(name=result['asteroid'])

                if result["file_path"] is None or result["error_msg"] is not None:
                    # Asteroid nao tem BSP JPL ou nao foi possivel o download.
                    asteroid.status = 'not_executed'
                    asteroid.error_msg = result['error_msg']
                    asteroid.save()
                    self.logger.warning(
                        "Asteroid [ %s ] - %s" % (asteroid.name, asteroid.error_msg))

                else:
                    obj.status = 'running'
                    self.logger.info("Registered %s Input for Asteroid [ %s ] File: [%s] " % (
                        result['input_type'], asteroid.name, result['file_path']))

                asteroid.execution_time = asteroid.execution_time + \
                    result['execution_time']
                asteroid.save()

        except Exception as e:
            self.on_error(instance, e)

        bsp_jpl_finish = datetime.now(timezone.utc)
        bsp_jpl_execution_time = bsp_jpl_finish - bsp_jpl_start

        self.logger.info("Finished BSP JPL in %s" %
                         humanize.naturaldelta(bsp_jpl_execution_time))

        instance.execution_bsp_jpl = bsp_jpl_execution_time

        # ===================================================================================================
        # GAIA Catalog - Generate GAIA Catalog for each asteroids
        # ===================================================================================================
        self.logger.info(
            "---------------------------------// GAIA CATALOG //---------------------------------")
        instance.step = 2
        instance.save()

        # Verificar qual versao do catalogo esta sendo usada, no momento da criacao desta etapa apenas 2 catalogos
        # sao possiveis o gaia_dr1 em formato aquivo e o gaia_dr2 em banco de dados.
        # essa etapa e necessaria apenas para o caso do catalogo estar em banco de dados.

        # Reload na lista de asteroids agora sem os que falharam na etapa anterior.
        self.asteroids = AstrometryAsteroid.objects.filter(
            astrometry_run=instance.pk).exclude(status__in=list(['failure', 'not_executed']))

        star_catalog = instance.catalog

        self.logger.info("Catalog: %s" % star_catalog.display_name)

        if star_catalog.tablename is not None:
            self.logger.info("Generate %s Catalog for each asteroid" %
                             star_catalog.display_name)

            catalog_start = datetime.now(timezone.utc)

            pool = ThreadPoolExecutor(max_workers=4)
            futures = []
            idx = 1

            try:
                for obj in self.asteroids:

                    self.logger.info(
                        "Creating star catalog [ %s / %s ] Object: [ %s ]" % (idx, self.asteroids.count(), obj.name))

                    obj.status = 'running'
                    obj.save()

                    catalog_filename = "%s.csv" % star_catalog.name
                    catalog_filepath = os.path.join(
                        obj.relative_path, catalog_filename)
                    self.logger.debug("Catalog Filepath: %s" %
                                      catalog_filepath)

                    ccd_images_input = obj.input_file.get(
                        input_type='ccd_images_list')
                    ccd_images_path = ccd_images_input.file_path
                    self.logger.debug("CCD IMAGES FILE: %s" % ccd_images_path)

                    futures.append(pool.submit(
                        create_star_catalog,
                        run_id,
                        obj.name,
                        ccd_images_path,
                        catalog_filepath,
                        star_catalog.schema,
                        star_catalog.tablename,
                        star_catalog.ra_property,
                        star_catalog.dec_property))

                    idx += 1

                # Esperar todas as execucoes.
                wait(futures)

                results = []
                for future in futures:
                    results.append(future.result())

                for result in results:
                    # Registar a quantidade de CCDs para cada Asteroid
                    asteroid = self.asteroids.get(name=result['asteroid'])

                    if result['error_msg'] is not None:
                        asteroid.status = 'not_executed'
                        asteroid.error_msg = result['error_msg']

                        self.logger.warning(
                            "Asteroid [ %s ] - %s" % (asteroid.name, asteroid.error_msg))
                    else:
                        asteroid.catalog_rows = int(result['catalog_count'])
                        obj.status = 'running'

                        self.logger.info("Registered %s Input for Asteroid [ %s ] Catalog Rows: [ %s ] File: [%s] " % (
                            result['input_type'], asteroid.name, result['catalog_count'], result['file_path']))

                    asteroid.execution_time = asteroid.execution_time + \
                        result['execution_time']

                    asteroid.save()

            except Exception as e:
                self.on_error(instance, e)

            catalog_finish = datetime.now(timezone.utc)
            catalog_execution_time = catalog_finish - catalog_start

            self.logger.info("Finished Star Catalog in %s" %
                             humanize.naturaldelta(catalog_execution_time))

        instance.execution_catalog = catalog_execution_time    

        # Fim da geracao dos inputs. 

        # ===================================================================================================
        # PRAIA Astrometry - Run PRAIA programns for each asteroid.
        # ===================================================================================================
        self.logger.info(
            "---------------------------------// PRAIA ASTROMETRY //---------------------------------")
        # Submissao dos jobs no cluster

        instance.step = 3
        instance.save()

        # Reload na lista de asteroids agora sem os que falharam na etapa anterior.
        self.asteroids = AstrometryAsteroid.objects.filter(
            astrometry_run=instance.pk).exclude(status__in=list(['failure', 'not_executed']))

        # Nome do catalogo dentro do container e diferente
        # TODO: Resolver isso no cotainer
        if star_catalog.name == 'gaia_dr2':
            catalog_name = 'gaia2'
        elif star_catalog.name == 'gaia_dr1':
            catalog_name = 'gaia1'
        else:
            catalog_name = 'gaia1'

        condor_jobs = list()

        # Condor precisa do path absoluto para escrever os arquivos de log.
        absolute_archive_path = os.getenv("ARCHIVE_DIR", None)
        if absolute_archive_path is None:
            raise Exception(
                "absolute path to archive directory is required. This path must be declared in the ARCHIVE_DIR environment variable.")

        for obj in self.asteroids:
            # para cada objeto fazer a submissao do job na API do condor.
            self.logger.info(
                "Submit Astrometry Job [ %s / %s ] Object: [ %s ]" % (idx, self.asteroids.count(), obj.name))

            # Criar o diretorio de log para condor
            relative_condor_dir = os.path.join(obj.relative_path, 'condor')
            if not os.path.exists(relative_condor_dir):
                os.makedirs(relative_condor_dir)
                time.sleep(2)
                os.chmod(relative_condor_dir, stat.S_IRWXU |
                         stat.S_IRWXG | stat.S_IRWXO)

            if not os.path.exists(relative_condor_dir):
                raise Exception("Failed to create condor log directory.")

            obj_absolute_path = os.path.join(
                absolute_archive_path, obj.relative_path.strip('/'))
            log_dir = os.path.join(obj_absolute_path, 'condor')
            self.logger.info(
                "Trying to create condor log directory. [ %s ]" % log_dir)

            asteroid_alias = obj.name.replace(' ', '')
            payload = dict({
                "queues": 1,
                "submit_params": {
                    "Universe": "docker",
                    "Docker_image": "linea/tno_astrometry:latest",
                    # "Should_transfer_files": "yes",
                    # "when_to_transfer_output": "on_exit",
                    # "+RequiresWholeMachine": "True",
                    "Requirements": "Machine == \"apl16.ib0.cm.linea.gov.br\"",
                    "executable": "/app/run.py",
                    "arguments": "%s --path %s --catalog %s" % (asteroid_alias, obj.relative_path, catalog_name),
                    "Log": os.path.join(log_dir, "astrometry.log"),
                    "Output": os.path.join(log_dir, "astrometry.out"),
                    "Error": os.path.join(log_dir, "astrometry.err")

                    # "arguments": "Eris --path /proccess/4/objects/Eris --catalog gaia2",
                    # "Log": "/archive/des/tno/testing/proccess/4/objects/Eris/condor/astrometry-$(Process).log",
                    # "Output": "/archive/des/tno/testing/proccess/4/objects/Eris/condor/astrometry-$(Process).out",
                    # "Error": "/archive/des/tno/testing/proccess/4/objects/Eris/condor/astrometry-$(Process).err"
                }
            })
            self.logger.debug("payload: ")
            self.logger.debug(payload)
            try:
                url = 'http://loginicx.linea.gov.br:5001/submit_job'
                headers = {'Content-Type': 'application/json'}

                r = requests.post(url, headers=headers,
                                  data=json.dumps(payload))
                r.status_code

                response = r.json()
                # TODO tratar errors durante o Post.
                self.logger.debug(r.status_code)
                self.logger.debug("Result Status Code: [%s] Response: [ %s ]" % (
                    r.status_code, response))

                if response['success'] is True:
                    # Submetido com sucesso, Guardar o Id do Job para ser consultado
                    for job in response['jobs']:
                        self.logger.debug(job)

                        condorJob = register_condor_job(
                            instance, obj, job['ClusterId'], job['ProcId'], job['JobStatus'])

                        self.logger.info("Job in Condor was created. ClusterId [ %s ] ProcId [ %s ]" % (
                            condorJob.clusterid, condorJob.procid))

                    obj.status = 'pending'
                    obj.save()

            except Exception as e:
                # TODO Tratar erro na submissao de jobs
                obj.status = 'failure'
                obj.error_msg("Job submission failed. Error: %s" % e)
                obj.save()                
                # self.on_error(self.instance, e)


        # Nome descritivo do arquivo txt gerado pelo PRAIA "Astrometric observed ICRF positions"

        # Encerrar a Rodada de Astrometria
        # self.set_execution_time(instance)

        # Acrescentar os totais de asteroids por status.
        # csuccess = instance.asteroids.filter(status='success').count()
        # cfailure = instance.asteroids.filter(status='failure').count()
        # cwarning = instance.asteroids.filter(status='warning').count()
        cnotexecuted = instance.asteroids.filter(status='not_executed').count()

        # Salvar os totais e mudar o status para sucesso.
        # TODO: essa etapa quando executada com o condor deve ficar na
        # funcao que vai registrar os resutados.
        instance.refresh_from_db()
        instance.status = 'running'
        # instance.count_success = csuccess
        # instance.count_failed = cfailure
        # instance.count_warning = cwarning
        instance.count_not_executed = cnotexecuted
        instance.save()
        # self.logger.info("Status changed to Success")

        self.logger.info("Finish")


    def get_astrometry_position_filename(self, name):
        return name.replace(" ", "") + "_obs.txt"


    def on_error(self, instance, error):
        trace = traceback.format_exc()
        self.logger.error(error)
        self.logger.error(trace)

        self.set_execution_time(instance)
        instance.refresh_from_db()
        instance.error_msg = error
        instance.error_traceback = trace
        instance.status = 'failure'
        instance.save()

        raise(error)

    def set_execution_time(self, instance):
        start_time = instance.start_time
        finish_time = datetime.now(timezone.utc)
        tdelta = finish_time - start_time

        instance.refresh_from_db()
        instance.finish_time = finish_time
        instance.execution_time = tdelta
        instance.save()
        self.logger.info("Execution Time: %s" % humanize.naturaldelta(tdelta))
