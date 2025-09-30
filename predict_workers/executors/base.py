# apps/pipeline/executors/base.py
from abc import ABC, abstractmethod
from typing import Dict

class ExecResult:
    def __init__(self, ok: bool, job_id: str = "", error: str = ""):
        self.ok = ok
        self.job_id = job_id
        self.error = error

class Executor(ABC):
    @abstractmethod
    def submit(self, task: "PredictionTask") -> dict: ...
    
    # @abstractmethod
    # def cancel(self, task: "PredictionTask") -> bool: ...
    
    # @abstractmethod
    # def inspect(self, task: "PredictionTask") -> Dict: ...  # status do job no backend
