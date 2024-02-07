#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Celery Beat"
# https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html#beat-custom-schedulers
# https://pypi.org/project/django-celery-beat/
# celery -A coreAdmin beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler
rm -f '/tmp/celeryd.pid'
celery -A coreAdmin beat \
    -l INFO \
    -s /tmp/celerybeat-schedule \
    --pidfile="/tmp/celeryd.pid" \
    --logfile="/log/celeryd.log"
