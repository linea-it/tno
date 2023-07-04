import os

from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coreAdmin.settings')

app = Celery('tno')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html
app.conf.beat_schedule = {
    # 'add-every-30-seconds': {
    #     'task': 'tno.tasks.add',
    #     'schedule': 30.0,
    #     'args': (16, 16)
    # },
    # 'test-periodic-every-30-seconds': {
    #     'task': 'tno.tasks.teste_periodic_task',
    #     'schedule': 30.0,
    # },
    'genmap-every-day-at-23': {
        'task': 'tno.tasks.generate_maps',
        'schedule': crontab(hour='23')
    } 

}
app.conf.timezone = 'UTC'

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

