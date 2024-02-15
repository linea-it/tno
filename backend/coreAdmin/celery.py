import os

from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "coreAdmin.settings")

app = Celery("tno")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html
app.conf.beat_schedule = {
    "garbage-collector-every-three-hours": {
        "task": "tno.tasks.garbage_collector",
        "schedule": crontab(minute=0, hour="*/3"),
        # 'schedule': 30.0
    },
    "prediction-map-every-hour": {
        "task": "tno.tasks.create_prediction_maps",
        # a job is scheduled to run for every first minute of every hour
        "schedule": crontab(hour="*", minute=1),
        # 'schedule': 30.0
    },
    # Executes every Monday morning at 2:00 a.m.
    "update_asteroid_table-every-hour": {
        "task": "tno.tasks.update_asteroid_table",
        "schedule": crontab(hour=2, minute=0, day_of_week=1),
    },
    # Calculo Occultation Path foi adicionado ao pipeline nao sendo mais necessario
    # Ser executado pelo portal.
    # 'occultation-path-coeff-every-10-minutes': {
    #     'task': 'tno.tasks.create_occultation_path_coeff',
    #     'schedule': crontab(minute='*/10')
    # },
    # 'add-every-30-seconds': {
    #     'task': 'tno.tasks.add',
    #     'schedule': 30.0,
    #     'args': (16, 16)
    # },
    # 'test-periodic-every-30-seconds': {
    #     'task': 'tno.tasks.teste_periodic_task',
    #     'schedule': 30.0,
    # },
    # 'genmap-every-day-at-23': {
    #     'task': 'tno.tasks.generate_maps',
    #     'schedule': crontab(hour='23', minute='0')
    # },
    # 'cleanmap-every-day-at-3': {
    #     'task': 'tno.tasks.cleanup_maps',
    #     'schedule': crontab(hour='3', minute='0')
    # }
}
app.conf.timezone = "UTC"

# Load task modules from all registered Django apps.
app.autodiscover_tasks()
