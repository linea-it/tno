# # apps/pipeline/dao.py
# from django.db import transaction, connection
# from django.utils import timezone
# from .models import PredictionTask

# def fetch_tasks_for_state(target_state: str, limit: int = 50):
#     """
#     Lock otimista: pega tasks por prioridade sem bloquear a fila inteira.
#     """
#     with connection.cursor() as cur:
#         cur.execute("""
#             SELECT id
#             FROM pipeline_asteroidtask
#             WHERE state = %s
#                 AND (attempt_count < max_retries OR max_retries = -1)
#                 AND (NOT EXISTS (
#                     SELECT 1 FROM pipeline_taskattempt a
#                     WHERE a.task_id = pipeline_asteroidtask.id
#                     AND a.backoff_until IS NOT NULL
#                     AND a.backoff_until > NOW()
#                 ))
#             ORDER BY priority ASC, created_at ASC
#             FOR UPDATE SKIP LOCKED
#             LIMIT %s
#         """, [target_state, limit])
#         rows = cur.fetchall()
#     ids = [r[0] for r in rows]
#     # Marcar transição dentro de uma transação
#     tasks = (PredictionTask.objects
#             .select_for_update()
#             .filter(id__in=ids))
#     return list(tasks)

# @transaction.atomic
# def transition_task(task: PredictionTask, new_state: str):
#     task.state = new_state
#     task.save(update_fields=["state", "updated_at"])