#!/bin/bash  --login

set -o errexit
set -o pipefail
set -o nounset

JOBID=$1

# O env.sh já configura CACHE_DIR, XDG_CACHE_HOME, ASTROPY_CACHE_DIR
# baseado em PARSL_ENV e outras variáveis
source /app/src/env.sh

# DEBUG_CACHE_VERIFICATION_START
echo "=== DEBUG: rerun.sh - After sourcing env.sh ==="
echo "DEBUG: CACHE_DIR in shell: '${CACHE_DIR:-NOT_SET}'"
echo "DEBUG: XDG_CACHE_HOME in shell: '${XDG_CACHE_HOME:-NOT_SET}'"
echo "DEBUG: ASTROPY_CACHE_DIR in shell: '${ASTROPY_CACHE_DIR:-NOT_SET}'"
echo "DEBUG: PARSL_ENV in shell: '${PARSL_ENV:-NOT_SET}'"
echo "DEBUG: About to call: python rerun.py $JOBID"
echo "=== DEBUG: rerun.sh End ==="
# DEBUG_CACHE_VERIFICATION_END

echo "Rerun job ${JOBID} in a local environment to test the pipeline"
python rerun.py $JOBID
