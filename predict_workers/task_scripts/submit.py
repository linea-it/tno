import json
import os
import pathlib
from base_worker import BaseWorker
from dao.models import PredictionState
from executors.slurm import SlurmExecutor
from executors.local import LocalExecutor


class SubmitWorker(BaseWorker):
    def __init__(self, worker_name, database_url):
        super().__init__(worker_name, database_url)
        self.state_to_process = 'READY_FOR_RUN'
        
        executor_type = os.getenv("EXECUTOR", "slurm")

        if executor_type == "local":
            self.executor = LocalExecutor()
            self.log.info("Using Local Executor")

        if executor_type == "slurm":
            self.executor = SlurmExecutor()
            self.log.info("Using Slurm Executor")

        
    def perform_task(self, task, db_session):
        self.log.info(f"Performing submit step for task id: {task.id}")

        # Change task status to SUBMITTING
        self.update_task_status(db_session, task, PredictionState.SUBMITTING)

        executor_task =  self.executor.submit(task)

        self.log.info(f"Task submitted with Job ID: [ {executor_task.get('id')} ]")
        self.log.debug(executor_task)

        with open(pathlib.Path(task.workdir).joinpath('slurm_task.json'), "w") as f:
            json.dump(executor_task, f, indent=2)

        # Change task status to QUEUED
        self.update_task_status(db_session, task, PredictionState.QUEUED, slurm_job_id=int(executor_task.get('id')))


