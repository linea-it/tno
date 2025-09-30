from base_worker import BaseWorker
from dao.models import PredictionState
from executors.slurm import SlurmExecutor


class SubmitWorker(BaseWorker):
    def __init__(self, worker_name, database_url):
        super().__init__(worker_name, database_url)
        self.state_to_process = 'READY_FOR_RUN'

        
    def perform_task(self, task, db_session):
        self.log.info(f"Performing submit step for task id: {task.id}")

        # Change task status to SUBMITTING
        self.update_task_status(db_session, task, PredictionState.SUBMITTING)

        executor = SlurmExecutor()
        
        executor_task =  executor.submit(task)

        self.log.info(f"Task submitted with Job ID: [ {executor_task.get('id')} ]")
        self.log.debug(executor_task)


        # Change task status to QUEUED
        self.update_task_status(db_session, task, PredictionState.QUEUED, slurm_job_id=int(executor_task.get('id')))


