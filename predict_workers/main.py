import logging
import os
import sys

from task_scripts.ingest import IngestWorker
from task_scripts.prepare import PrepareWorker
from task_scripts.submit import SubmitWorker

# Database and worker configurations
DATABASE_URL = os.getenv("DATABASE_URL", None)
WORKER_NAME = os.getenv("WORKER_NAME", f"worker_{os.getpid()}") # Unique name for the worker
WORKER_SCRIPT = os.getenv("WORKER_SCRIPT", None)  # Script que o worker deve executar ( PREPARE, SUBMIT, INGEST )


if __name__ == "__main__":

    if (not WORKER_SCRIPT):
        raise Exception("The WORKER_SCRIPT environment variable is not defined.")
    if (not DATABASE_URL):
        raise Exception("The DATABASE_URL environment variable is not defined.")
    
    worker_instance = None

    if WORKER_SCRIPT == "PREPARE":
        worker_instance = PrepareWorker(WORKER_NAME, DATABASE_URL)
    if WORKER_SCRIPT == "SUBMIT":
        worker_instance = SubmitWorker(WORKER_NAME, DATABASE_URL)
    if WORKER_SCRIPT == "INGEST":
        worker_instance = IngestWorker(WORKER_NAME, DATABASE_URL)

    worker_instance.run()


