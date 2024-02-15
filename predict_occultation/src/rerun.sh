#!/bin/bash  --login

set -o errexit
set -o pipefail
set -o nounset

JOBID=$1

source /app/src/env.sh

echo "Rerun job ${JOBID} in a local environment to test the pipeline"
python rerun.py $JOBID
