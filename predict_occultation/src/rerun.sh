#!/bin/bash  --login

set -o errexit
set -o pipefail
set -o nounset

JOBID=$1

# O env.sh já configura CACHE_DIR, XDG_CACHE_HOME, ASTROPY_CACHE_DIR
# baseado em PARSL_ENV e outras variáveis
source /app/src/env.sh

echo "Rerun job ${JOBID} in a local environment to test the pipeline"
python rerun.py $JOBID
