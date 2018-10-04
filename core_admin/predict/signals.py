from django.db.models.signals import post_save
from django.dispatch import receiver
from predict.models import PredictRun
import os
import logging
# from orbit.refine_orbit import RefineOrbit, RefineOrbitDB
from predict.prediction_occultation import PredictionOccultation
import shutil
from datetime import datetime
@receiver(post_save, sender=PredictRun)
def on_create_orbit_run(sender, instance, signal, created, **kwargs):
    """

    """
    logger = logging.getLogger("predict_occultation")

    if created:
        logger.info("Was Created a new record of Refine Orbit Run")

        PredictionOccultation().start_predict_occultation(instance)

    else:
        if instance.status == "pending":
            logger.info("Re-execute the Refine Orbit step")

            if instance.relative_path and os.path.exists(instance.relative_path):
                logger.info("Deleting directory from previous run")

                logger.debug("Directory: %s" % instance.relative_path)
                shutil.rmtree(instance.relative_path)

            PredictionOccultation().start_predict_occultation(instance)


