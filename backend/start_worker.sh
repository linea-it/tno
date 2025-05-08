#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Celery Worker to listen to all queues..."

# Remove any existing Celery PID files
rm -f '/tmp/celery*.pid'
rm -f '/tmp/celery.pid'

# Start the Celery worker with all queues specified
celery -A coreAdmin worker \
    -l INFO \
    --pidfile="/tmp/%n.pid" \
    --logfile="/logs/%n%I.log" \
    --queues=default,maintenance,scheduled,thumbnails  # Add all queues here
