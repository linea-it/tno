import time
from predict_occultation.models import PredictionTask, PredictionState
from predict_occultation.workflow import run_ingest_step
import django.db.models as models
from django.utils import timezone
import logging

def ingest_worker(interval=2.0, batch=5):

    log = logging.getLogger("predict_occ_ingest_worker")
    log.info("Starting ingest_worker")
    while True:
        log.info("-"*40)
        tasks = (
            PredictionTask.objects.filter(state=PredictionState.WAITING_RESULTS, aborted=False)
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
            log.info(f"Running ingest step for task [{task.id}] priority [{task.priority}] (asteroid {task.asteroid_id})")
            run_ingest_step(task)
