from django.db.models.signals import post_save
from django.dispatch import receiver
from orbit.models import OrbitRun
import os
import logging
from orbit.refine_orbit import RefineOrbit, RefineOrbitDB
import shutil

@receiver(post_save, sender=OrbitRun)
def on_create_orbit_run(sender, instance, signal, created, **kwargs):
    """

    """
    logger = logging.getLogger("refine_orbit")

    if created:
        logger.info("Was Created a new record of Refine Orbit Run")

        RefineOrbit().startRefineOrbitRun(instance)

    else:
        if instance.status == "pending":
            logger.info("Re-execute the Refine Orbit step")

            if os.path.exists(instance.relative_path):
                logger.info("Deleting directory from previous run")

                logger.debug("Directory: %s" % instance.relative_path)
                shutil.rmtree(instance.relative_path)


            RefineOrbit().startRefineOrbitRun(instance)


