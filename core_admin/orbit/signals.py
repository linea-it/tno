from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import OrbitRun, BspJplFile
import os
import logging
from orbit.refine_orbit import RefineOrbit
import shutil
from datetime import datetime
import threading
from orbit.bsp_jpl import BSPJPL


@receiver(post_save, sender=OrbitRun)
def on_create_orbit_run(sender, instance, signal, created, **kwargs):
    """

    """
    logger = logging.getLogger("refine_orbit")

    if created:
        logger.info("Was Created a new record of Refine Orbit Run")

        # Start Thread to run.
        thread = threading.Thread(target=run_refine, args=(instance.id, ))
        thread.daemon = True
        thread.start()

    else:
        if instance.status == "pending":
            logger.info("Re-execute the Refine Orbit step")

            if instance.relative_path and os.path.exists(instance.relative_path):
                logger.info("Deleting directory from previous run")

                logger.debug("Directory: %s" % instance.relative_path)
                shutil.rmtree(instance.relative_path)

            # Start Thread to run.
            thread = threading.Thread(target=run_refine, args=(instance.id, ))
            thread.daemon = True
            thread.start()


def run_refine(run_id):
    logger = logging.getLogger("refine_orbit")
    logger.info(
        "Starting a thread to execute the refine orbit ID [%s]" % run_id)

    RefineOrbit().startRefineOrbitRun(run_id)


@receiver(pre_delete, sender=BspJplFile)
def delete_proccess(sender, instance, using, **kwargs):
    """
        Executado Toda vez que um registro de BSP JPL File for deletado,
    verifica se o arquivo existe no diretório e remove.

    :param sender:
    :param instance:
    :return:
    """
    file_path, bsp_model = BSPJPL().get_file_path(instance.name)

    if os.path.exists(file_path):
        os.unlink(file_path)
