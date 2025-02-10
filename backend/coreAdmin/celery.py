import logging
import os

import django
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for Celery workers
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "coreAdmin.settings")

# Ensure Django initializes before Celery starts
django.setup()

app = Celery("tno")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
# Load Celery config from Django settings
app.config_from_object("django.conf:settings", namespace="CELERY")


# Ensure logging works inside Celery workers
logging.basicConfig(
    level=logging.DEBUG,  # Capture ALL log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)


# https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html
app.conf.beat_schedule = {
    "garbage-collector-every-three-hours": {
        "task": "tno.tasks.garbage_collector",
        "schedule": crontab(minute=0, hour="*/3"),
        # 'schedule': 30.0
    },
    "prediction-map-every-30-minutes": {
        "task": "tno.tasks.create_thumbnail_maps",
        # a job is scheduled to run for every first minute of every hour
        # "schedule": crontab(hour="*", minute=1),
        "schedule": crontab(minute="*/30"),
    },
    # Executes every Monday morning at 2:00 a.m.
    "update_asteroid_table-every-monday": {
        "task": "tno.tasks.update_asteroid_table",
        "schedule": crontab(hour=2, minute=0, day_of_week=1),
    },
    # Executes every Day at 5:00 a.m.
    "predict_job_for_updated_asteroids": {
        "task": "tno.tasks.predict_jobs_by_updated_asteroids",
        "schedule": crontab(hour=5, minute=0),
    },
    # # Executes every 10th and 25th day of every month.
    # "predict_job_for_upper_end_update": {
    #     "task": "tno.tasks.predict_jobs_for_upper_end_update",
    #     "schedule": crontab(hour=15, minute=0, day_of_month="10,25"),
    # },
    # Run Filter and Send Mail every Day at 9:00 AM UTC/ 06:00 AM BRT
    "run_subscription_filter_and_send_mail": {
        "task": "tno.tasks.run_subscription_filter_and_send_mail",
        "schedule": crontab(hour=9, minute=0),
        "kwargs": {"force_run": False},  # Set to True if needed
    },
    # Update occultation highlights daily at 00:00 UTC
    "update_occultations_highlights": {
        "task": "tno.tasks.update_occultations_highlights",
        "schedule": crontab(hour=0, minute=0),
    },
    # Update Unique Asteroid cache table every 6 hours
    "update_unique_asteroid_cache": {
        "task": "tno.tasks.update_unique_asteroids",
        "schedule": crontab(hour="*/6", minute=0),
    },
    # Update Unique Dynclass cache table every 6:15 hours
    "update_unique_dynclass_cache": {
        "task": "tno.tasks.update_unique_dynclass",
        "schedule": crontab(hour="*/6", minute=15),
    },
    # Update asteroid class cache memcached every 3 hours
    "update_asteroid_classes_cache": {
        "task": "tno.tasks.update_asteroid_classes_cache",
        "schedule": crontab(hour="*/3", minute=0),
    },
}
app.conf.timezone = "UTC"

# Load task modules from all registered Django apps.
app.autodiscover_tasks()
