#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Celery Worker"
rm -f '/tmp/celery*.pid'
rm -f '/tmp/celery.pid'
celery -A coreAdmin worker \
    -l INFO \
    --pidfile="/tmp/%n.pid" \
    --logfile="/log/%n%I.log"        

# --concurrency=1 \
