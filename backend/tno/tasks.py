# Create your tasks here
from celery import shared_task
from datetime import datetime
# Example task
@shared_task
def add(x=2, y=2):
    print("Executou Add!")
    return x + y


# Example Periodic task
# Tarefa configurada para executar a cada 30 segundos
# Proposito de exemplo de funcionamento de uma tarefa periodica com 
# Celery beat
@shared_task
def teste_periodic_task():
    print(f"Executou Tarefa Pediodica. {datetime.now()}")
    return True

# Exemplo de task sendo executada por uma chamada na api
# http://localhost/api/teste/
@shared_task
def teste_api_task():
    print(f"Executou Tarefa submetida pela API. {datetime.now()}")
    return True