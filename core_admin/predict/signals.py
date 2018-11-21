from django.db.models.signals import post_save
from django.dispatch import receiver
from predict.models import PredictRun
import os
import logging
# from orbit.refine_orbit import RefineOrbit, RefineOrbitDB
from predict.prediction_occultation import PredictionOccultation
import shutil
from datetime import datetime
import threading

@receiver(post_save, sender=PredictRun)
def on_create_orbit_run(sender, instance, signal, created, **kwargs):
    """

    """
    logger = logging.getLogger("predict_occultation")

    if created:
        logger.info("Was Created a new record of Predict Occultation Run")

        # Start Thread to run.
        thread = threading.Thread(target=run_predict, args=(instance.id, ))
        thread.daemon = True 
        thread.start()   
    else:
        if instance.status == "pending":
            logger.info("Re-execute the Predict Occultation step")

            if instance.relative_path and os.path.exists(instance.relative_path):
                logger.info("Deleting directory from previous run")

                logger.debug("Directory: %s" % instance.relative_path)
                shutil.rmtree(instance.relative_path)


            # Start Thread to run.
            thread = threading.Thread(target=run_predict, args=(instance.id, ))
            thread.daemon = True 
            thread.start()   


def run_predict(run_id):
    logger = logging.getLogger("predict_occultation")
    logger.info("Starting a thread to execute the prediction ID [%s]" % run_id)

    PredictionOccultation().start_predict_occultation(run_id)

