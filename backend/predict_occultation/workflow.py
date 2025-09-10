import time
from django.utils import timezone
import random

from .models import (
    PredictionTask,
    PredictionAttempt,
    PredictionState,
    AttemptStage,
)


def transition(task: PredictionTask, new_state: str):
    old = task.state
    task.state = new_state
    task.updated_at = timezone.now()
    task.save(update_fields=["state", "updated_at"])
    print(f"[Transition] {task.id}: {old} -> {new_state}")


def record_attempt(task: PredictionTask, stage: str, success=True, error="", meta=None):
    att = PredictionAttempt.objects.create(
        task=task,
        stage=stage,
        success=success,
        error=error,
        meta=meta or {},
        finished_at=timezone.now(),
    )
    if not success:
        print(f"[Record Attempt] Marking task {task.id} as failed")
        task.mark_failed(str(error))
    return att


# -------------------
# Etapas simuladas
# -------------------

def run_prepare_step(task):

    try:
        # Muda o Status para PREPARING
        transition(task, PredictionState.PREPARING)

        # Simulação de possível falha (20% chance)
        if random.random() < 0.2:
            raise RuntimeError("Erro temporário na preparação")
        
        time.sleep(0.5)

        # TODO: o record attempt deve identificar falhas e guardar o tempo inicial tb.
        record_attempt(task, AttemptStage.PREPARE, True)
        transition(task, PredictionState.READY_FOR_RUN)

        # TODO: Funcionou corretamente o retry, 
        # mas acho que ao funcionar depois de falhar 
        # em uma etapa deveria zerar o retry e a mensagem de erro. 
    except Exception as e:
        record_attempt(task, AttemptStage.PREPARE, False, str(e))



def run_submit_step(task: PredictionTask):
    """
    Simula submissão ao cluster/orquestrador.
    """
    try:
        transition(task, PredictionState.SUBMITTING)

        # Simulação de possível falha (20% chance)
        if random.random() < 0.2:
            raise RuntimeError("Erro temporário na submissão")

        time.sleep(0.5)  # simulação

        # Mudar status para Queued
        record_attempt(task, AttemptStage.SUBMIT, True, meta={"job_id": "SIM123"})        
        transition(task, PredictionState.QUEUED)

        # # TODO: Running e Waiting Results serão marcados pelo worker do cluster.
        # transition(task, PredictionState.RUNNING)
        # # após "rodar", marcamos como finalizado no cluster
        # record_attempt(task, AttemptStage.RUN, True)
        # transition(task, PredictionState.WAITING_RESULTS)
    except Exception as e:
        record_attempt(task, AttemptStage.SUBMIT, False, str(e))


def run_run_step(task: PredictionTask):
    """
    Simula execução no cluster.
    """
    try:
        transition(task, PredictionState.RUNNING)
        
        # Simulação de possível falha (20% chance)
        if random.random() < 0.2:
            raise RuntimeError("Erro temporário na execução no cluster")

        time.sleep(random.randint(2, 10))  # simulação

        record_attempt(task, AttemptStage.RUN, True)
        transition(task, PredictionState.WAITING_RESULTS)

    except Exception as e:
        record_attempt(task, AttemptStage.RUN, False, str(e))


def run_ingest_step(task: PredictionTask):
    """
    Simula ingestão em banco (bulk insert).
    """
    try:
        transition(task, PredictionState.INGESTING)

        # Simulação de possível falha (20% chance)
        if random.random() < 0.2:
            raise RuntimeError("Erro temporário na ingestão")

        time.sleep(0.5)  # simulação

        record_attempt(task, AttemptStage.INGEST, True)
        transition(task, PredictionState.DONE)

    except Exception as e:
        record_attempt(task, AttemptStage.INGEST, False, str(e))