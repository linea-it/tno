#!/bin/bash --login

set -o errexit
set -o pipefail

source /app/src/env.sh

echo "Starting the daemon" 
while true; do python /app/src/run_daemon.py ; sleep 30; done
