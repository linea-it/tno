
from executors.base import Executor
from executors.maestro import Maestro
import os

class SlurmExecutor(Executor):
    def __init__(self):

        self.base_url = os.getenv("ORCHESTRATION_API", None)
        if not self.base_url:
            raise ValueError("ORCHESTRATION_API environment variable is not set")

        if not os.getenv("ORCHESTRATION_CLIENT_ID", None):
            raise ValueError("ORCHESTRATION_CLIENT_ID environment variable is not set")

        if not os.getenv("ORCHESTRATION_CLIENT_SECRET", None):
            raise ValueError("ORCHESTRATION_CLIENT_SECRET environment variable is not set")

        self.maestro =  Maestro(self.base_url)

    def submit(self, task: "PredictionTask") -> dict:

        slurm_task = self.maestro.start("predict_occultation", {
            "task_id": task.id,
            "job_id": None, # TODO definir de onde vai vir o job id
            "asteroid_name": task.asteroid_id,
            "asteroid_path": task.workdir,
        })

        # Exemplo de retorno da Orchestration
        # {
        #     'id': 220,
        #     'owner': 'pipeline_manager',
        #     'path_str': 'predict_occultation/00000220',
        #     'pipeline': 'predict_occultation',
        #     'pipeline_version': '0.0.1',
        #     'used_config': '{"message": "Hello World", "asteroid_path": "/data/outputs/277"}',
        #     'created_at': '2025-10-02T17:18:00.594232Z',
        #     'started_at': None,
        #     'ended_at': None,
        #     'executor': 'slurm',
        #     'worker': None,
        #     'task_id': 'a346c397-f747-4191-8a51-71d50619797b',
        #     'pid': None,
        #     'status': 6,
        #     'comment': None,
        #     'user': 3
        # }

        return slurm_task

    # def cancel(self, task: "PredictionTask") -> bool:
    #     # Implement the logic to cancel a job in the Slurm API
    #     pass

    # def inspect(self, task: "PredictionTask") -> dict:
    #     # Implement the logic to inspect a job in the Slurm API
    #     pass

if __name__ == "__main__":

    exec_slurm = SlurmExecutor()
    exec_slurm.submit({})