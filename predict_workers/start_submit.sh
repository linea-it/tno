#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Submit Worker"

export WORKER_SCRIPT="SUBMIT"

python /app/main.py