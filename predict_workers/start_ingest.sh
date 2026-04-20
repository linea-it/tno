#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Ingest Worker"

export WORKER_SCRIPT="INGEST"

python /app/main.py