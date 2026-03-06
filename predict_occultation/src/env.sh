#!/bin/bash --login

echo "Activating py3 environment"
conda activate py3

# ============================================================
# CONFIGURAR CACHE DO ASTROPY
# CACHE_DIR deve ser definido no arquivo .env
# Este diretório de cache é usado para todos os tipos de cache (Astropy, etc.)
# ============================================================
if [[ -z "$CACHE_DIR" ]]; then
    echo "ERROR: CACHE_DIR is not set!"
    echo "       CACHE_DIR must be defined in .env file."
    echo "       This cache directory is used for all types of cache (Astropy, etc.)"
    exit 1
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

export PYTHONPATH=${PYTHONPATH:-}:${PIPELINE_ROOT:-}:${PIPELINE_PREDIC_OCC:-}:${PIPELINE_PATH:-}
echo "PYTHONPATH           ${PYTHONPATH}"

umask 0002
