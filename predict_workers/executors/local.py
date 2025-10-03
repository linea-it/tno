from executors.base import Executor
import datetime
import json


class LocalExecutor(Executor):
    """Executor that simulates job submission locally for testing purposes."""

    def __init__(self):
        pass

    def submit(self, task: "PredictionTask") -> dict:
        # Exemplo de retorno da Orchestration

        slurm_task = {
            "id": 999,
            "owner": "pipeline_manager",
            "path_str": "predict_occultation/00000220",
            "pipeline": "predict_occultation",
            "pipeline_version": "0.0.1",
            "used_config": json.dumps(
                {
                    "task_id": int(task.id),
                    "job_id": None,  # TODO definir de onde vai vir o job id
                    "asteroid_name": str(task.asteroid_id),
                    "asteroid_path": str(task.workdir),
                }
            ),
            "created_at": datetime.datetime.now().isoformat(),
            "started_at": None,
            "ended_at": None,
            "executor": "local",
            "worker": None,
            "task_id": "a346c397-f747-4191-8a51-71d50619797b",
            "pid": None,
            "status": 6,
            "comment": None,
            "user": 3,
        }

        return slurm_task

    # def cancel(self, task: "PredictionTask") -> bool:
    #     # Implement the logic to cancel a job in the Slurm API
    #     pass

    # def inspect(self, task: "PredictionTask") -> dict:
    #     # Implement the logic to inspect a job in the Slurm API
    #     pass


if __name__ == "__main__":

    exec_local = LocalExecutor()
    exec_local.submit({})
