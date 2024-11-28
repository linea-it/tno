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
    "prediction-map-every-30-minutes": {
        "task": "tno.tasks.create_prediction_maps",
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
}
app.conf.timezone = "UTC"

# Load task modules from all registered Django apps.
app.autodiscover_tasks()
