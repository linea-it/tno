#!/bin/bash --login

echo "Activating py3 environment"
conda activate py3

# ============================================================
# CONFIGURAR CACHE DO ASTROPY
# Depende exclusivamente de PARSL_ENV
# ============================================================
if [[ -z "$CACHE_DIR" ]]; then
    if [[ "$PARSL_ENV" = "linea" ]]; then
        # Para linea: cache no Lustre via REMOTE_PIPELINE_ROOT
        if [[ -z "$REMOTE_PIPELINE_ROOT" ]]; then
            echo "ERROR: REMOTE_PIPELINE_ROOT is not set for 'linea' environment!"
            echo "       This must be configured in .env file or docker-compose.yml"
            exit 1
        fi
        export CACHE_DIR="${REMOTE_PIPELINE_ROOT}/cache"
    else
        # Para local: cache dentro do container
        export CACHE_DIR="/app/cache"
    fi
fi

export XDG_CACHE_HOME=${CACHE_DIR}
export ASTROPY_CACHE_DIR=${CACHE_DIR}/astropy

# Criar diretório de cache se não existir
mkdir -p ${ASTROPY_CACHE_DIR}

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
