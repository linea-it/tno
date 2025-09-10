# apps/pipeline/executors/slurm_api.py
import requests
from .base import Executor, ExecResult
class SlurmAPIExecutor(Executor):
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip("/")
        self.token = token

    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    def submit(self, task):
        payload = {"pipeline": "predict_occultation",
                    "used_config": {"asteroid_path": task.workdir}}
        try:
            r = requests.post(f"{self.base_url}/api/processes/", json=payload,
                                headers=self._headers(), timeout=15)
            if r.status_code == 201:
                data = r.json()
                return ExecResult(ok=True, job_id=str(data.get("slurm_job_id", "")))
            return ExecResult(ok=False, error=f"{r.status_code} {r.text}")
        except Exception as e:
            return ExecResult(ok=False, error=str(e))

    def cancel(self, task):
        if not task.slurm_job_id:
            return True
        r = requests.post(f"{self.base_url}/api/jobs/{task.slurm_job_id}/cancel",
                            headers=self._headers(), timeout=10)
        return r.status_code in (200, 202)

    def inspect(self, task):
        if not task.slurm_job_id:
            return {"state": "UNKNOWN"}
        r = requests.get(f"{self.base_url}/api/jobs/{task.slurm_job_id}",
                            headers=self._headers(), timeout=10)
        return r.json()
