from tno.models import Proccess
import os, errno
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
from .models import AstrometryAsteroid, AstrometryInput

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
        'error': None
    })

    try:
        ccds, ccds_count = FilterObjects().ccd_images_by_object(name)

        if ccds_count > 0:

            headers = ['id', 'pfw_attempt_id', 'desfile_id', 'nite', 'date_obs', 'expnum', 'ccdnum', 'band', 'exptime', 'cloud_apass', 'cloud_nomad', 't_eff', 'crossra0', 'radeg', 'decdeg', 'racmin', 'racmax', 'deccmin', 'deccmax', 'ra_cent', 'dec_cent', 'rac1', 'rac2', 'rac3', 'rac4', 'decc1', 'decc2', 'decc3', 'decc4', 'ra_size', 'dec_size', 'path', 'filename', 'compression', 'downloaded']

            with open(output_filepath, mode='w') as temp_file:
                writer = csv.DictWriter(temp_file, delimiter=';', fieldnames=headers)
                writer.writeheader()
                writer.writerows(ccds)

            result.update({
                'file_size': os.path.getsize(output_filepath),
                'ccds_count': ccds_count
            })
        else:
            result.update({
                'error': "No CCD Image found for this object.",
            })

    except Exception as e:
        result.update({
            'input_type': 'ccd_images_list',
            'error': e
        })

    finish = datetime.now(timezone.utc)
    result.update({
        'start_time': start,
        'finish_time': finish,
        'execution_time': finish - start
    })

    return result

def retrieve_bsp_jpl(name, output):

    # verificar se ja existe bsp baixado dentro da validade.
    rows = FilterObjects().check_bsp_jpl_by_object(name, 30)
    if len(rows) == 1:
        # Copiar o arquivo para o diretorio do objeto. 
        original_file_path, bsp_file_record = BSPJPL().get_file_path(name)

        bsp_file = os.path.basename(original_file_path)
        f = os.path.join(output, bsp_file)

        shutil.copy2(original_file_path, f)

        if os.path.exists(f):
            return f
        else:
            # TODO erro na copia de um bsp ja baixado
            return None
    else:
        pass
        # TODO implementar o Download do bsp

        return None


def create_gaia_dr2_catalog(ccd_images_file, output):

    rows = []

    with open(ccd_images_file, 'r') as cfile:
        reader = csv.DictReader(cfile, delimiter=';')
        for row in reader:

            # Query no banco de catalogos 
            coordinates = [
                row['rac1'], row['decc1'], row['rac2'], row['decc2'], row['rac3'], row['decc3'], row['rac4'], row['decc4']]

            resultset = CatalogDB().poly_query(
                "gaia_dr2", "ra", "dec", coordinates, "gaia"
            )

            for row in resultset:
                rows.append(row)

    if len(rows) > 0:
        headers = []
        for head in rows[0]:
            headers.append(head)

        with open(output, 'w') as tempFile:
            writer = csv.DictWriter(tempFile, delimiter=';', fieldnames=headers)
            writer.writeheader()
            writer.writerows(rows)

    if os.path.exists(output):
        return output
    else:
        return None


class Astrometry():
    def __init__(self):
        self.logger = logging.getLogger("astrometry")

        self.proccess = None
        self.input_list = None
        self.objects_dir = None

        # TODO: este diretorio e provisorio para simular a execucao do PRAIA
        self.astrometry_positions_dir = settings.ASTROMETRY_POSITIONS_DIR

    def startAstrometryRun(self, instance):
        instance.status = 'running'
        instance.start_time = datetime.now(timezone.utc)
        instance.save()
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
            directory = os.path.join(self.proccess.relative_path, directory_name)
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
        asteroids = AstrometryAsteroid.objects.filter(astrometry_run=instance.pk)

        self.logger.info("Register Objects End. Count: [%s]" % asteroids.count())


        pool = ThreadPoolExecutor(max_workers=4)
        futures = []        
        idx = 1
        try:
            
            for obj in asteroids:
            
                self.logger.info("Running [ %s / %s ] Object: [ %s ]" % (idx, obj_count, obj.name))

                obj_dir = obj.relative_path

                # CCD Images 
                ccd_images_file = os.path.join(obj_dir, "ccd_images.csv")

                self.logger.debug("CCD Images CSV: [ %s ]" % ccd_images_file)
   
                futures.append(pool.submit(create_ccd_images_list, obj.name, ccd_images_file))

                # # BSP JPL 
                # futures.append(pool.submit(retrieve_bsp_jpl, name, obj_dir))

                idx += 1

            # Esperar todas as execucoes.
            wait(futures)

            results = []
            for future in futures:
                results.append(future.result())

            self.logger.debug("Results:  %s " % results)

            # Registrar os inputs
            self.logger.info("Register Inputs")
            for result in results:
                asteroid = asteroids.get(name=result["asteroid"])

                self.logger.debug("Asteroid Name: %s" % asteroid.pk)

                input_model, create = AstrometryInput.objects.update_or_create(
                    asteroid=asteroid,
                    input_type=result["input_type"],
                    defaults={
                        'filename': result["filename"],
                        'file_size': result["file_size"],
                        'file_type': result["file_type"],
                        'file_path': result["file_path"],
                        'error_msg': result["error"],
                        'start_time': result["start_time"],
                        'finish_time': result["finish_time"],
                        'execution_time': result["execution_time"],
                    })
                input_model.save()

        except Exception as e:
            self.on_error(instance, e)


        # # Query no catalogo GAIA 2
        # # TODO deve ter um parametro para escolher qual catalogo. 
        # pool = ThreadPoolExecutor()
        # futures = []        
        # idx = 1
        # try:
        #     for obj in objects:           
        #         self.logger.info("Generate GAIA DR2 Catalog %s / %s Object: [ %s ]" % (idx, obj_count, obj.get('name')))

        #         name = obj.get("name").replace(" ", "_")
        #         obj_dir = os.path.join(self.objects_dir, name)
        #         gaia_dr2_csv = os.path.join(obj_dir, "gaia_dr2.csv")
        #         ccd_images_file = os.path.join(obj_dir, "ccd_images.csv")

        #         futures.append(pool.submit(create_gaia_dr2_catalog, ccd_images_file, gaia_dr2_csv))

        #     # Esperar todas as execucoes.
        #     wait(futures)

        #     outputs = []
        #     for future in futures:
        #         outputs.append(future.result())

        #     self.logger.debug("OUTPUT : [ %s ]" % outputs)

        #     wait(futures)

        #     idx += 1

        # except Exception as e:
        #     tb = traceback.format_exc()
        #     self.logger.error(e)
        #     self.logger.error(tb)



        # Submissao dos jobs no cluster

        # Nome descritivo do arquivo txt gerado pelo PRAIA "Astrometric observed ICRF positions"

        # Encerrar a Rodada de Astrometria
        self.set_execution_time(instance)
        instance.status = 'success'
        instance.save()
        self.logger.info("Status changed to Success")

    def get_astrometry_position_filename(self, name):
        return name.replace(" ", "") + "_obs.txt"




    def on_error(self, instance, error):
        trace = traceback.format_exc()
        self.logger.error(error)
        self.logger.error(trace)

        self.set_execution_time(instance)

        instance.error_msg = error
        instance.error_traceback = trace
        instance.status = 'failure'
        instance.save()

        raise(error)


    def set_execution_time(self, instance):
        start_time = instance.start_time
        finish_time = datetime.now(timezone.utc)
        tdelta = finish_time - start_time
        instance.execution_time = tdelta
        instance.save()
        self.logger.info("Execution Time: %s" % humanize.naturaldelta(tdelta))
    
