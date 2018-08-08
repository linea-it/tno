from tno.models import Proccess
import os, errno
import logging
from random import randrange
import time
from tno.db import DBBase
from tno.skybotoutput import FilterObjects
from tno.proccess import ProccessManager
from django.conf import settings
import shutil


class Astrometry():
    def __init__(self):
        self.logger = logging.getLogger("astrometry")

        self.proccess = None
        self.input_list = None
        self.objects_dir = None

        # TODO: este diretorio e provisorio para simular a execucao do PRAIA
        self.astrometry_positions_dir = settings.ASTROMETRY_POSITIONS_DIR

    def startAstrometryRun(self, instance):
        self.logger.info("TESTE")
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

        # TODO este Sleep deve sair
        # time.sleep(randrange(15))

        # TODO: Importar a Classe responsavel por rodar a ASTROMETRIA


        # TODO Copiar um arquivo de resultado do praia para o diretorio do Objeto
        # Recuperando os Objetos
        objects, obj_count = ProccessManager().get_objects(tablename=self.input_list.tablename,
                                                           schema=self.input_list.schema)
        #
        self.logger.debug("Objects: %s" % obj_count)

        # TODO esta parte e uma simulacao do resultado do PRAIA.
        for obj in objects:

            name = obj.get("name").replace(" ", "_")

            filename = self.get_astrometry_position_filename(obj.get("name"))

            original_file = os.path.join(self.astrometry_positions_dir, filename)

<<<<<<< HEAD
=======

            # Rename object_name_obs.txt -> objectname.txt
            filename = filename.replace('_obs', '').replace('_', '')
>>>>>>> 414bbd0e5e97aa621ff37761e1b72ce62127e56b
            obj_dir = os.path.join(self.objects_dir, name)
            new_file = os.path.join(obj_dir, filename)

            # verificar se existe o arquivo para este objeto
            if os.path.exists(original_file):
                shutil.copy2(original_file, new_file)

                self.logger.debug("Object [ %s ] - COPY : %s -> %s" % (obj.get("name"), original_file, new_file))

        # Nome descritivo do arquivo txt gerado pelo PRAIA "Astrometric observed ICRF positions"


        # Encerrar a Rodada do praia
        instance.status = 'success'
        instance.save()
        self.logger.info("Status changed to Success")

    def get_astrometry_position_filename(self, name):
        return name.replace(" ", "") + "_obs.txt"
