import logging
import os
import shutil

from django.db.models.signals import post_save
from django.dispatch import receiver
from praia.models import Run

from .astrometry import Astrometry


@receiver(post_save, sender=Run)
def on_create_praia_run_signal(sender, instance, signal, created, **kwargs):
    """

    """
    logger = logging.getLogger("astrometry")

    if created:
        logger.info("Was Created a new record of PRAIA Run")

        Astrometry().startAstrometryRun(instance)


    else:
        if instance.status == "pending":
            logger.info("Re-execute the Astrometry step")

            if os.path.exists(instance.relative_path):
                logger.info("Deleting directory from previous run")

                logger.debug("Directory: %s" % instance.relative_path)
                shutil.rmtree(instance.relative_path)

            Astrometry().startRefineOrbitRun(instance)
