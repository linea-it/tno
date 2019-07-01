from tno.models import Proccess
import os, errno
import logging
from random import randrange
import time
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

def create_ccd_images_list(name, output):
    # Recuperar as exposicoes para cada objeto.

    ccds, ccds_count = FilterObjects().ccd_images_by_object(name)

    headers = ['id', 'pfw_attempt_id', 'desfile_id', 'nite', 'date_obs', 'expnum', 'ccdnum', 'band', 'exptime', 'cloud_apass', 'cloud_nomad', 't_eff', 'crossra0', 'radeg', 'decdeg', 'racmin', 'racmax', 'deccmin', 'deccmax', 'ra_cent', 'dec_cent', 'rac1', 'rac2', 'rac3', 'rac4', 'decc1', 'decc2', 'decc3', 'decc4', 'ra_size', 'dec_size', 'path', 'filename', 'compression', 'downloaded']

    with open(output, mode='w') as temp_file:
        writer = csv.DictWriter(temp_file, delimiter=';', fieldnames=headers)
        writer.writeheader()
        writer.writerows(ccds)

    if os.path.exists(output):
        return output
    else:
        return None

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
        directory_name = "astrometry_%s" % instance.id
        directory = os.path.join(proccess.relative_path, directory_name)

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
            instance.status = 'error'
            instance.save()
            self.logger.error("Failed to create astrometry directory [ %s ]" % directory)
            if e.errno != errno.EEXIST:
                self.logger.error(e)
                raise

        # Recuperando os Objetos
        objects, obj_count = ProccessManager().get_objects(tablename=self.input_list.tablename,
                                                           schema=self.input_list.schema)

        self.logger.debug("Objects: %s" % obj_count)

        pool = ThreadPoolExecutor(max_workers=4)
        futures = []        
        idx = 1
        try:
            
            for obj in objects:
            
                self.logger.info("Running %s / %s Object: [ %s ]" % (idx, obj_count, obj.get('name')))


                # CCD Images 
                name = obj.get("name").replace(" ", "_")
                obj_dir = os.path.join(self.objects_dir, name)
                ccd_images_file = os.path.join(obj_dir, "ccd_images.csv")

                self.logger.debug("CCD Images CSV: [ %s ]" % ccd_images_file)
   
                futures.append(pool.submit(create_ccd_images_list, name, ccd_images_file))

                # BSP JPL 
                futures.append(pool.submit(retrieve_bsp_jpl, name, obj_dir))


            # Esperar todas as execucoes.
            wait(futures)

            outputs = []
            for future in futures:
                outputs.append(future.result())

            self.logger.debug("OUTPUT : [ %s ]" % outputs)

            wait(futures)

            idx += 1

        except Exception as e:
            tb = traceback.format_exc()
            self.logger.error(e)
            self.logger.error(tb)


        # Query no catalogo GAIA 2
        # TODO deve ter um parametro para escolher qual catalogo. 
        pool = ThreadPoolExecutor()
        futures = []        
        idx = 1
        try:
            for obj in objects:           
                self.logger.info("Generate GAIA DR2 Catalog %s / %s Object: [ %s ]" % (idx, obj_count, obj.get('name')))

                name = obj.get("name").replace(" ", "_")
                obj_dir = os.path.join(self.objects_dir, name)
                gaia_dr2_csv = os.path.join(obj_dir, "gaia_dr2.csv")
                ccd_images_file = os.path.join(obj_dir, "ccd_images.csv")

                futures.append(pool.submit(create_gaia_dr2_catalog, ccd_images_file, gaia_dr2_csv))

            # Esperar todas as execucoes.
            wait(futures)

            outputs = []
            for future in futures:
                outputs.append(future.result())

            self.logger.debug("OUTPUT : [ %s ]" % outputs)

            wait(futures)

            idx += 1

        except Exception as e:
            tb = traceback.format_exc()
            self.logger.error(e)
            self.logger.error(tb)

            # # Pesquisando os bsp_jpl que precisam ser baixadas
            # bsp_jpl = RefineOrbitDB().get_bsp_jpl(self.input_list.tablename, self.input_list.schema, max_age)

            # self.bsp_jpl_input_file = os.path.join(instance.relative_path, 'bsp_jpl.csv')

            # self.logger.info("Writing BSP JPL Input File")
            # RefineOrbit().writer_refine_orbit_file_list(self.bsp_jpl_input_file, bsp_jpl)

            # # Download dos BSP JPL
            # self.getBspJplFiles(instance, self.bsp_jpl_input_file, steps_file)

            # t_download_1 = datetime.now()
            # t_download_delta = t_download_1 - t_download_0

            # self.results["execution_download_time"] = t_download_delta.total_seconds()

            # self.logger.info("Download Finish in %s" % humanize.naturaldelta(t_download_delta))



            # Recuperar as exposicoes para cada objeto.
            # ccds, ccds_count = FilterObjects().ccd_images_by_object(obj.get('name'))
            # self.logger.debug("CCD Images: [ %s ]" % ccds_count)

            # name = obj.get("name").replace(" ", "_")
            # obj_dir = os.path.join(self.objects_dir, name)
            # ccd_images_file = os.path.join(obj_dir, "ccd_images.csv")

            # self.logger.debug("CCD Images CSV: [ %s ]" % ccd_images_file)

            # with open(ccd_images_file, mode='w') as temp_file:
            #     writer = csv.DictWriter(temp_file, delimiter=';')

            #     writer.writerows(ccds)       

 







            # filename = self.get_astrometry_position_filename(obj.get("name"))

            # original_file = os.path.join(self.astrometry_positions_dir, filename)


            # # Rename object_name_obs.txt -> objectname.txt
            # filename = filename.replace('_obs', '').replace('_', '')
            # obj_dir = os.path.join(self.objects_dir, name)
            # new_file = os.path.join(obj_dir, filename)

            # # verificar se existe o arquivo para este objeto
            # if os.path.exists(original_file):
            #     shutil.copy2(original_file, new_file)

            #     self.logger.debug("Object [ %s ] - COPY : %s -> %s" % (obj.get("name"), original_file, new_file))

            # time.sleep(2)

        # Nome descritivo do arquivo txt gerado pelo PRAIA "Astrometric observed ICRF positions"


        # Encerrar a Rodada do praia
        instance.status = 'success'
        instance.save()
        self.logger.info("Status changed to Success")

    def get_astrometry_position_filename(self, name):
        return name.replace(" ", "") + "_obs.txt"





