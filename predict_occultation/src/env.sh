#!/bin/bash --login

echo "Activating py3 environment"
conda activate py3

# ============================================================
# CONFIGURAR CACHE DO ASTROPY
# Depende exclusivamente de PARSL_ENV
# ============================================================
# DEBUG_CACHE_VERIFICATION_START
echo "=== DEBUG: Cache Configuration Start ==="
echo "DEBUG: CACHE_DIR before check: '${CACHE_DIR:-NOT_SET}'"
echo "DEBUG: PARSL_ENV: '${PARSL_ENV:-NOT_SET}'"
echo "DEBUG: REMOTE_PIPELINE_ROOT: '${REMOTE_PIPELINE_ROOT:-NOT_SET}'"
# DEBUG_CACHE_VERIFICATION_END

if [[ -z "$CACHE_DIR" ]]; then
    # DEBUG_CACHE_VERIFICATION_START
    echo "DEBUG: CACHE_DIR is not set, determining from PARSL_ENV"
    # DEBUG_CACHE_VERIFICATION_END
    if [[ "$PARSL_ENV" = "linea" ]]; then
        # DEBUG_CACHE_VERIFICATION_START
        echo "DEBUG: PARSL_ENV=linea, checking REMOTE_PIPELINE_ROOT"
        # DEBUG_CACHE_VERIFICATION_END
        # Para linea: cache no Lustre via REMOTE_PIPELINE_ROOT
        if [[ -z "$REMOTE_PIPELINE_ROOT" ]]; then
            echo "ERROR: REMOTE_PIPELINE_ROOT is not set for 'linea' environment!"
            echo "       This must be configured in .env file or docker-compose.yml"
            exit 1
        fi
        export CACHE_DIR="${REMOTE_PIPELINE_ROOT}/cache"
        # DEBUG_CACHE_VERIFICATION_START
        echo "DEBUG: Set CACHE_DIR for linea: ${CACHE_DIR}"
        # DEBUG_CACHE_VERIFICATION_END
    else
        # DEBUG_CACHE_VERIFICATION_START
        echo "DEBUG: PARSL_ENV is not 'linea', using local cache"
        # DEBUG_CACHE_VERIFICATION_END
        # Para local: cache dentro do container
        export CACHE_DIR="/app/cache"
        # DEBUG_CACHE_VERIFICATION_START
        echo "DEBUG: Set CACHE_DIR for local: ${CACHE_DIR}"
        # DEBUG_CACHE_VERIFICATION_END
    fi
else
    # DEBUG_CACHE_VERIFICATION_START
    echo "DEBUG: CACHE_DIR already set to: ${CACHE_DIR}"
    # DEBUG_CACHE_VERIFICATION_END
fi

export XDG_CACHE_HOME=${CACHE_DIR}
export ASTROPY_CACHE_DIR=${CACHE_DIR}/astropy

# DEBUG_CACHE_VERIFICATION_START
echo "DEBUG: After export - CACHE_DIR: '${CACHE_DIR}'"
echo "DEBUG: After export - XDG_CACHE_HOME: '${XDG_CACHE_HOME}'"
echo "DEBUG: After export - ASTROPY_CACHE_DIR: '${ASTROPY_CACHE_DIR}'"
# DEBUG_CACHE_VERIFICATION_END

# Criar diretório de cache se não existir
mkdir -p ${ASTROPY_CACHE_DIR}

# DEBUG_CACHE_VERIFICATION_START
echo "DEBUG: Created cache directory: ${ASTROPY_CACHE_DIR}"
echo "DEBUG: Cache directory exists: $([ -d "${ASTROPY_CACHE_DIR}" ] && echo 'YES' || echo 'NO')"
echo "DEBUG: Cache directory readable: $([ -r "${ASTROPY_CACHE_DIR}" ] && echo 'YES' || echo 'NO')"
echo "=== DEBUG: Cache Configuration End ==="
# DEBUG_CACHE_VERIFICATION_END

echo "Cache directory: ${CACHE_DIR}"
echo "PARSL_ENV: ${PARSL_ENV}"

if [[ "$PARSL_ENV" = "linea" ]]
then
    export PIPELINE_PREDIC_OCC=${REMOTE_PIPELINE_ROOT}
    export PIPELINE_PATH=${REMOTE_PIPELINE_ROOT}/pipeline
    export REMOTE_CONDA_PATH=${REMOTE_PIPELINE_ROOT}/miniconda/bin

    ulimit -s 100000
    ulimit -u 100000

    echo "REMOTE_PIPELINE_ROOT : ${REMOTE_PIPELINE_ROOT}"
    echo "PIPELINE_PREDIC_OCC  : ${PIPELINE_PREDIC_OCC}"
    echo "PIPELINE_PATH        : ${PIPELINE_PATH}"
    echo "PREDICT_OUTPUTS      : ${PREDICT_OUTPUTS}"
    echo "PREDICT_INPUTS       : ${PREDICT_INPUTS}"
    echo "REMOTE_CONDA_PATH    : ${REMOTE_CONDA_PATH}"
fi

export PYTHONPATH=${PYTHONPATH}:${PIPELINE_ROOT}:${PIPELINE_PREDIC_OCC}:${PIPELINE_PATH}
echo "PYTHONPATH           ${PYTHONPATH}"

umask 0002
