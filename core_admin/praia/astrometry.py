from tno.models import Proccess
import os
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
from praia.praia_astrometry import PraiaPipeline
import csv
import traceback
from concurrent.futures import ThreadPoolExecutor, wait, as_completed
from orbit.bsp_jpl import BSPJPL
from .models import Run, AstrometryAsteroid, AstrometryInput


def create_ccd_images_list(name, output_filepath):
    # Recuperar as exposicoes para cada objeto.
    start = datetime.now(timezone.utc)

    result = dict({
        'asteroid': name,
        'input_type': 'ccd_images_list',
        'filename': os.path.basename(output_filepath),
        'file_type': 'csv',
        'file_size': None,
        'file_path': output_filepath,
        'ccds_count': None,
        'error_msg': None
    })

    try:
        ccds, ccds_count = FilterObjects().ccd_images_by_object(name)

        if ccds_count is not None and ccds_count > 0:

            headers = ['id', 'pfw_attempt_id', 'desfile_id', 'nite', 'date_obs', 'expnum', 'ccdnum', 'band', 'exptime', 'cloud_apass', 'cloud_nomad', 't_eff', 'crossra0', 'radeg', 'decdeg', 'racmin', 'racmax',
                       'deccmin', 'deccmax', 'ra_cent', 'dec_cent', 'rac1', 'rac2', 'rac3', 'rac4', 'decc1', 'decc2', 'decc3', 'decc4', 'ra_size', 'dec_size', 'path', 'filename', 'compression', 'downloaded', ]

            with open(output_filepath, mode='w') as temp_file:
                writer = csv.DictWriter(
                    temp_file, delimiter=';', fieldnames=headers)
                writer.writeheader()
                writer.writerows(ccds)

            result.update({
                'file_size': os.path.getsize(output_filepath),
                'ccds_count': ccds_count
            })
        else:
            result.update({
                'error_msg': "No CCD Image found for this object.",
            })

    except Exception as e:
        result.update({
            'error_msg': e
        })

    finish = datetime.now(timezone.utc)
    result.update({
        'start_time': start,
        'finish_time': finish,
        'execution_time': finish - start
    })

    return result


def retrieve_bsp_jpl(name, output_filepath):
    """
        Recupera o BSP JPL para um asteroid. 
        verifica se o existe algum bsp ja baixado para o asteroid. 
        se existir faz uma copia para o diretorio do objeto. 
        se nao existir faz o download. 
    """
    start = datetime.now(timezone.utc)
    filename = "%s.bsp" % name.replace(' ', '_')
    logger = logging.getLogger("astrometry")
    result = dict({
        'asteroid': name,
        'input_type': 'bsp_jpl',
        'filename': filename,
        'file_type': 'bsp',
        'file_size': None,
        'file_path': None,
        'error_msg': None
    })
    try:
        # verificar se ja existe bsp baixado dentro da validade.
        rows = FilterObjects().check_bsp_jpl_by_object(name, 30)
        if len(rows) == 1:
            logger.debug(
                "A valid BSP_JPL already exists for this asteroid. [ %s ]" % name)
            # Copiar o arquivo para o diretorio do objeto.
            original_file_path, bsp_model = BSPJPL().get_file_path(name)

            bsp_file = os.path.basename(original_file_path)
            f = os.path.join(output_filepath, bsp_file)

            shutil.copy2(original_file_path, f)

            if os.path.exists(f):
                result.update({
                    'file_path': f,
                    'file_size': os.path.getsize(output_filepath),
                })
            else:
                result.update({
                    'error_msg': "Failed to copy the BSP JPL file. [ %s -> %s ]" % (original_file_path, f)
                })
        else:
            logger.debug(
                "BSP JPL not have or is old, a new download will be executed. [ %s ]" % name)
            bsp_path = BSPJPL().get_bsp_basepath()

            record = BSPJPL().download(name, filename, bsp_path, logger)

            if record is not None:
                bsp_model, created = BSPJPL().update_or_create_record(record)

                # Copy bsp from BSP_JPL_DIR to Asteroid DIR
                original_file_path = record.get("file_path")
                bsp_file = os.path.join(output_filepath, filename)
                shutil.copy2(original_file_path, bsp_file)

                if os.path.exists(bsp_file):
                    result.update({
                        'file_path': bsp_file,
                        'file_size': os.path.getsize(bsp_file),
                    })
                else:
                    result.update({
                        'error_msg': "Failed to copy the BSP JPL file. [ %s -> %s ]" % (original_file_path, bsp_file)
                    })
            else:
                result.update({
                    'error_msg': "Failed to download the BSP JPL file."
                })

    except Exception as e:
        trace = traceback.format_exc()
        logger.error(e)
        logger.error(trace)

        result.update({
            'error_msg': e
        })

    finish = datetime.now(timezone.utc)
    result.update({
        'start_time': start,
        'finish_time': finish,
        'execution_time': finish - start
    })

    return result


def create_star_catalog(name, ccd_images_file, output_filepath, schema, tablename, ra_property, dec_property):
    # Criar um Catalogo de Estrelas para cada CCD do objeto
    start = datetime.now(timezone.utc)

    result = dict({
        'asteroid': name,
        'input_type': 'catalog',
        'filename': os.path.basename(output_filepath),
        'file_type': 'csv',
        'file_size': None,
        'file_path': output_filepath,
        'catalog_count': None,
        'error_msg': None
    })

    rows = []
    try:
        with open(ccd_images_file, 'r') as cfile:
            reader = csv.DictReader(cfile, delimiter=';')
            for row in reader:

                # Query no banco de catalogos
                coordinates = [
                    row['rac1'], row['decc1'], row['rac2'], row['decc2'], row['rac3'], row['decc3'], row['rac4'], row['decc4']]

                resultset = CatalogDB().poly_query(
                    schema=schema,
                    tablename=tablename,
                    ra_property=ra_property,
                    dec_property=dec_property,
                    positions=coordinates,
                )

                for star in resultset:
                    star.update({'ccd_id': row['id']})
                    rows.append(star)

        if len(rows) > 0:
            headers = []
            for head in rows[0]:
                headers.append(head)

            with open(output_filepath, 'w') as tempFile:
                writer = csv.DictWriter(
                    tempFile, delimiter=';', fieldnames=headers)
                writer.writeheader()
                writer.writerows(rows)

            if os.path.exists(output_filepath):
                result.update({
                    'file_size': os.path.getsize(output_filepath),
                    'catalog_count': len(rows)
                })
            else:
                result.update({
                    'error_msg': "Catalog file was not created",
                })
        else:
            result.update({
                'error_msg': "The query in the catalog did not return any results",
            })

    except Exception as e:
        result.update({
            'error_msg': e
        })

    finish = datetime.now(timezone.utc)
    result.update({
        'start_time': start,
        'finish_time': finish,
        'execution_time': finish - start
    })

    return result


class Astrometry():
    def __init__(self):
        self.logger = logging.getLogger("astrometry")

        self.proccess = None
        self.input_list = None
        self.objects_dir = None
        self.instance = None
        self.asteroid = []

        # TODO: este diretorio e provisorio para simular a execucao do PRAIA
        self.astrometry_positions_dir = settings.ASTROMETRY_POSITIONS_DIR

    def startAstrometryRun(self, run_id):

        instance = Run.objects.get(pk=run_id)

        instance.status = 'running'
        instance.start_time = datetime.now(timezone.utc)
        instance.save()

        self.instance = instance

        self.logger.info("Status changed to Running")

        self.logger.info("PRAIA RUN %s" % instance.id)

        self.logger.debug("Input List: %s" % instance.input_list.id)

        self.input_list = instance.input_list

        # No caso de uma re execucao o processo ja existe
        if instance.proccess is None:
            # Como a Astrometria e a primeira etapa ela fica responsavel por iniciar o processo.
            self.logger.info("Creating a Process")

            proccess = Proccess.objects.create(
                owner=instance.owner,
                input_list=instance.input_list
            )

            proccess.save()
            self.logger.info("Process Created with ID [ %s ]" % proccess.id)

            instance.proccess = proccess
            instance.save()

        self.proccess = instance.proccess

        # TODO Confirmar o por que o diretorio de astrometria informa ser criado mais as vezes nao e.
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
                os.chmod(directory, 0o775)

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

                asteroidModel, created = AstrometryAsteroid.objects.update_or_create(
                    astrometry_run=instance,
                    name=obj.get("name"),
                    defaults={
                        'number': obj.get("number"),
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

                self.logger.info(
                    "Running CCD Images [ %s / %s ] Object: [ %s ]" % (idx, obj_count, obj.name))

                obj_dir = obj.relative_path

                # CCD Images
                ccd_images_file = os.path.join(obj_dir, "ccd_images.csv")

                self.logger.debug("CCD Images CSV: [ %s ]" % ccd_images_file)

                futures.append(pool.submit(
                    create_ccd_images_list, obj.name, ccd_images_file))

                idx += 1

            # Esperar todas as execucoes.
            wait(futures)

            results = []
            for future in futures:
                results.append(future.result())

            # self.logger.debug("Results:  %s " % results)

            self.logger.info("Register CCD Images Inputs")
            for result in results:
                self.register_input(result)

                # Registar a quantidade de CCDs para cada Asteroid
                asteroid = self.asteroids.get(name=result['asteroid'])

                if result["ccds_count"] is None or result["ccds_count"] == 0:
                    # Asteroid nao tem CCD image associada a ele, marcar como falha.
                    asteroid.status = 'not_executed'
                    asteroid.error_msg = result['error_msg']
                    asteroid.save()
                    self.logger.warning(result)
                else:
                    asteroid.ccd_images = result['ccds_count']

                asteroid.execution_time = result['execution_time']
                asteroid.save()

        except Exception as e:
            self.on_error(instance, e)

        ccd_images_finish = datetime.now(timezone.utc)
        ccd_images_execution_time = ccd_images_finish - ccd_images_start

        self.logger.info("Finished CCD Images list in %s" %
                         humanize.naturaldelta(ccd_images_execution_time))

        # ===================================================================================================
        # BSP JPL - Retrieve BSP JPL  for every asteroid
        # ===================================================================================================
        self.logger.info(
            "---------------------------------// BSP JPL //---------------------------------")
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

                # BSP JPL
                futures.append(pool.submit(retrieve_bsp_jpl,
                                           obj.name, obj.relative_path))

                idx += 1

            # Esperar todas as execucoes.
            wait(futures)

            results = []
            for future in futures:
                results.append(future.result())

            # self.logger.debug("Results:  %s " % results)

            self.logger.info("Register BSP JPL Inputs")
            for result in results:
                self.register_input(result)

                # Registar a quantidade de CCDs para cada Asteroid
                asteroid = self.asteroids.get(name=result['asteroid'])

                if result["file_path"] is None or result["error_msg"] is not None:
                    # Asteroid nao tem BSP JPL ou nao foi possivel o download.
                    asteroid.status = 'not_executed'
                    asteroid.error_msg = result['error_msg']
                    asteroid.save()
                    self.logger.warning(result)

                asteroid.execution_time = asteroid.execution_time + \
                    result['execution_time']
                asteroid.save()

        except Exception as e:
            self.on_error(instance, e)

        bsp_jpl_finish = datetime.now(timezone.utc)
        bsp_jpl_execution_time = bsp_jpl_finish - bsp_jpl_start

        self.logger.info("Finished BSP JPL in %s" %
                         humanize.naturaldelta(bsp_jpl_execution_time))

        # ===================================================================================================
        # GAIA Catalog - Generate GAIA Catalog for each asteroids
        # ===================================================================================================
        self.logger.info(
            "---------------------------------// GAIA CATALOG //---------------------------------")

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

                # self.logger.debug("Results:  %s " % results)

                self.logger.info("Register Catalog Inputs")
                for result in results:
                    self.register_input(result)

                    # Registar a quantidade de CCDs para cada Asteroid
                    asteroid = self.asteroids.get(name=result['asteroid'])

                    if result['error_msg'] is not None:
                        asteroid.status = 'not_executed'
                        asteroid.error_msg = result['error_msg']

                        self.logger.warning(result)
                    else:
                        asteroid.catalog_rows = int(result['catalog_count'])
                        self.logger.debug("Catalog Rows: %s" %
                                          result['catalog_count'])

                    asteroid.execution_time = asteroid.execution_time + \
                        result['execution_time']
                    asteroid.save()

            except Exception as e:
                self.on_error(instance, e)

            catalog_finish = datetime.now(timezone.utc)
            catalog_execution_time = catalog_finish - catalog_start

            self.logger.info("Finished Star Catalog in %s" %
                             humanize.naturaldelta(catalog_execution_time))

        self.logger.info(
            "---------------------------------// FAKE RUN //---------------------------------")
        # FAKE RUN Copia os arquivos de resultados da Astrometria.

        # Reload na lista de asteroids agora sem os que falharam na etapa anterior.
        self.asteroids = AstrometryAsteroid.objects.filter(
            astrometry_run=instance.pk).exclude(status__in=list(['failure', 'not_executed']))

        try:
            for obj in self.asteroids:
                name = obj.name.replace(" ", "_")

                filename = self.get_astrometry_position_filename(obj.name)

                original_file = os.path.join(
                    self.astrometry_positions_dir, filename)

                # Rename object_name_obs.txt -> objectname.txt
                filename = filename.replace('_obs', '').replace('_', '')
                # obj_dir = os.path.join(self.objects_dir, name)
                new_file = os.path.join(obj.relative_path, filename)

                # verificar se existe o arquivo para este objeto
                if os.path.exists(original_file):
                    shutil.copy2(original_file, new_file)

                    self.logger.debug(
                        "Object [ %s ] - COPY : %s -> %s" % (obj.name, original_file, new_file))

                    obj.status = 'success'

                else:
                    obj.status = 'failure'

                obj.save()

            #     self.logger.debug("Object [ %s ] - COPY : %s -> %s" % (obj.get("name"), original_file, new_file))

            # time.sleep(2)

        except Exception as e:
            self.on_error(instance, e)

        # Submissao dos jobs no cluster

        # Nome descritivo do arquivo txt gerado pelo PRAIA "Astrometric observed ICRF positions"

        # Encerrar a Rodada de Astrometria
        self.set_execution_time(instance)

        instance.refresh_from_db()
        instance.status = 'success'
        instance.save()
        self.logger.info("Status changed to Success")

    def get_astrometry_position_filename(self, name):
        return name.replace(" ", "") + "_obs.txt"

    def register_input(self, asteroid_input):
        try:
            asteroid = self.asteroids.get(name=asteroid_input["asteroid"])

            input_model, create = AstrometryInput.objects.update_or_create(
                asteroid=asteroid,
                input_type=asteroid_input["input_type"],
                defaults={
                    'filename': asteroid_input["filename"],
                    'file_size': asteroid_input["file_size"],
                    'file_type': asteroid_input["file_type"],
                    'file_path': asteroid_input["file_path"],
                    'error_msg': asteroid_input["error_msg"],
                    'start_time': asteroid_input["start_time"],
                    'finish_time': asteroid_input["finish_time"],
                    'execution_time': asteroid_input["execution_time"],
                })
            input_model.save()

            self.logger.info("Registered %s Input for Asteroid [ %s ] File: [%s] " % (
                input_model.input_type, asteroid.name, input_model.file_path))

            return input_model

        except Exception as e:
            self.on_error(self.instance, e)

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
