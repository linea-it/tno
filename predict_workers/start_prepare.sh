#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Prepare Worker"

export WORKER_SCRIPT="PREPARE"

python /app/main.py