# Create your tasks here
from celery import shared_task
from tno.models import Occultation
import requests
from datetime import datetime, timedelta
from django.conf import settings

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

# task para gerar os mapas das ocultações todos os dias as 23:00
# a task tentará gerar os mapas das 50 primeiras ocultações do próximo dia
@shared_task
def generate_maps():
    tomorrow = datetime.now().date() + timedelta(1)
    occultations = Occultation.objects.filter(date_time__date = tomorrow).order_by('date_time')[:50]
    for occ in occultations:
        final_url="{0}/{1}".format(settings.SORA_SERVER,'map')
        myobj = {'body': occ.name, 'date': str(occ.date_time.date()), 'time': str(occ.date_time.time())}
        try:
            requests.post(final_url, json = myobj, verify=False, timeout=180000)
        except:
            continue