#!/bin/bash  --login

set -o errexit
set -o pipefail
set -o nounset

JOBID=$1

# O env.sh já configura CACHE_DIR, XDG_CACHE_HOME, ASTROPY_CACHE_DIR
# baseado em PARSL_ENV e outras variáveis
source /app/src/env.sh

# Cache verification and warming
if [[ -n "$CACHE_DIR" ]]; then
    echo "============================================================"
    echo "Cache verification and warming"
    echo "Cache directory: ${CACHE_DIR}"
    echo "============================================================"

    mkdir -p ${CACHE_DIR}/astropy

    # Always run warm_cache.py to ensure cache is verified and logged
    # The script will detect if cache exists and skip download if present
    echo "Running cache verification and warming (will use existing cache if available)..."
    if ! python3 /app/src/warm_cache.py --cache-dir ${CACHE_DIR}; then
        echo "ERROR: Cache warming failed"
        echo "Check logs: /app/logs/cache.log"
        exit 1
    fi

    echo "============================================================"
fi

echo "Rerun job ${JOBID} in a local environment to test the pipeline"
python rerun.py $JOBID
