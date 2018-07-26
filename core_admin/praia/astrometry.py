from tno.models import Proccess
import os, errno
import logging
from random import randrange
import time
from tno.db import DBBase
from tno.skybotoutput import FilterObjects
class Astrometry():
    def __init__(self):
        self.logger = logging.getLogger("astrometry")

    def startAstrometryRun(self, instance):

        instance.status = 'running'
        instance.save()
        self.logger.info("Status changed to Running")

        self.logger.info("PRAIA RUN %s" % instance.id)

        # Como a Astrometria e a primeira etapa ela fica responsavel por iniciar o processo.
        self.logger.info("Creating a Process")

        self.logger.debug("Input List: %s" % instance.input_list.id)

        proccess = Proccess.objects.create(
            owner=instance.owner,
            input_list=instance.input_list
        )

        proccess.save()
        self.logger.info("Process Created with ID [ %s ]" % proccess.id)

        instance.proccess = proccess
        instance.save()

        # TODO Confirmar o por que o diretorio de astrometria informa ser criado mais as vezes nao e.
        # Esperar o diretorio de processo ser criado.
        time.sleep(2)

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
        time.sleep(randrange(15))

        # TODO: Importar a Classe responsavel por rodar a ASTROMETRIA


        # TODO Copiar um arquivo de resultado do praia para o diretorio do Objeto

        # Nome descritivo do arquivo txt gerado pelo PRAIA "Astrometric observed ICRF positions"


        # Encerrar a Rodada do praia
        instance.status = 'success'
        instance.save()
        self.logger.info("Status changed to Success")

