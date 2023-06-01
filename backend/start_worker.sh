#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Celery Worker"
celery -A coreAdmin worker -l INFO

