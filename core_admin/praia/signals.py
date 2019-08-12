import logging
import os
import shutil

from django.db.models.signals import post_save
from django.dispatch import receiver
from praia.models import Run
import threading
from praia.pipeline import AstrometryPipeline


@receiver(post_save, sender=Run)
def on_create_praia_run_signal(sender, instance, signal, created, **kwargs):
    """

    """
    logger = logging.getLogger("astrometry")

    if created:
        logger.info("Was Created a new record of PRAIA Run")

        # Start Thread to run.
        thread = threading.Thread(target=run_astrometry, args=(instance.id, ))
        thread.daemon = True
        thread.start()

    else:
        if instance.status == "reexecute":
            logger.info("Re-execute the Astrometry step")

            if os.path.exists(instance.relative_path):
                logger.info("Deleting directory from previous run")

                logger.debug("Directory: %s" % instance.relative_path)
                shutil.rmtree(instance.relative_path)

                # apaga o registro dos asteroids
                instance.asteroids.all().delete()
                instance.condor_jobs.all().delete()

            # Start Thread to run.
            thread = threading.Thread(
                target=run_astrometry, args=(instance.id, ))
            thread.daemon = True
            thread.start()


def run_astrometry(run_id):
    logger = logging.getLogger("Run Astrometry")
    logger.info("Starting a thread to execute the Astrometry ID [%s]" % run_id)

    AstrometryPipeline().startAstrometryRun(run_id)
