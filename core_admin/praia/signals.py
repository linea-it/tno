from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from praia.models import Configuration
from praia.models import Run
from tno.models import Proccess
import os, errno
import logging
from random import randrange
import time

@receiver(post_save, sender=Run)
def on_create_praia_run_signal(sender, instance, signal, created, **kwargs):
    """

    """
    print("Entrou no PRAIA SIGNAL")
    logger = logging.getLogger("astrometry")

    if created:
        logger.info("Was Created a new record of PRAIA Run")


        # Como a Astrometria e a primeira etapa ela fica responsavel por iniciar o processo.
        logger.info("Creating a Process")
        proccess = Proccess.objects.create(
            owner=instance.owner
        )

        proccess.save()
        logger.info("Process Created with ID [ %s ]" % proccess.id)


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

                logger.info("Astrometry directory created")
                logger.debug("Directory: %s" % directory)

                instance.relative_path = directory
                instance.save()
            else:
                instance.status = 'error'
                instance.save()
                msg = "Failed to create astrometry directory [ %s ]" % directory
                logger.error(msg)
                raise Exception(msg)


        except OSError as e:
            instance.status = 'error'
            instance.save()
            logger.error("Failed to create astrometry directory [ %s ]" % directory)
            if e.errno != errno.EEXIST:
                logger.error(e)
                raise

        instance.status = 'running'
        instance.save()
        logger.info("Status changed to Running")


        time.sleep(randrange(15))

        # TODO: Importar a Classe responsavel por rodar a ASTROMETRIA

        # Encerrar a Rodada do praia
        instance.status = 'success'
        instance.save()
        logger.info("Status changed to Success")
