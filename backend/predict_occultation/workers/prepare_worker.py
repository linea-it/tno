import time
from django.utils import timezone
from predict_occultation.models import PredictionTask, PredictionState
from predict_occultation.workflow import run_prepare_step
import django.db.models as models

import logging

def prepare_worker(interval=2.0, batch=5):

        log = logging.getLogger("predict_occ_prepare_worker")

        log.info("Starting prepare_worker")
        while True:
            log.info("-"*40)
            tasks = (
                PredictionTask.objects.filter(
                    state=PredictionState.PENDING,
                    aborted=False,
                )
                .filter(
                    models.Q(next_retry_at__isnull=True) | models.Q(next_retry_at__lte=timezone.now())
                )
                .order_by("-priority", "created_at")[:batch]
            )
            log.debug(f"Found {tasks.count()} tasks to process.")

            if not tasks.exists():
                log.debug("No tasks found, sleeping...")
                time.sleep(interval)
                continue
            for task in tasks:
                log.info(f"Running prepare step for task [{task.id}] priority [{task.priority}] (asteroid {task.asteroid_id})")
                run_prepare_step(task)
