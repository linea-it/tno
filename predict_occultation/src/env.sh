#!/bin/bash --login

echo "Activating py3 environment"
conda activate py3


if [[ "$PARSL_ENV" = "linea" ]]
then
    export PIPELINE_PREDIC_OCC=${REMOTE_PIPELINE_ROOT}
    export PIPELINE_PATH=${REMOTE_PIPELINE_ROOT}/pipeline
    export REMOTE_CONDA_PATH=${REMOTE_PIPELINE_ROOT}/miniconda/bin

    ulimit -s 100000
    ulimit -u 100000
    
    # Configure astropy cache on lead node (before Python imports astropy)
    # Use shared filesystem location based on PREDICT_INPUTS
    if [ -z "${XDG_CACHE_HOME:-}" ] && [ -n "${PREDICT_INPUTS:-}" ]; then
        cache_base_dir=$(dirname "$PREDICT_INPUTS")/.astropy_cache
        export XDG_CACHE_HOME=${cache_base_dir}
        mkdir -p ${XDG_CACHE_HOME}/astropy
        echo "XDG_CACHE_HOME set to: ${XDG_CACHE_HOME}"
    fi
    
    # Propagate monitoring environment variables if they exist
    # These need to be in environment when get_config() runs on lead node
    if [ -n "${BENCHMARK_ENABLED:-}" ]; then
        export BENCHMARK_ENABLED="${BENCHMARK_ENABLED}"
    fi
    if [ -n "${RESOURCE_MONITOR:-}" ]; then
        export RESOURCE_MONITOR="${RESOURCE_MONITOR}"
    fi
fi

echo "REMOTE_PIPELINE_ROOT : ${PIPELINE_ROOT}"
echo "PIPELINE_PREDIC_OCC  : ${PIPELINE_PREDIC_OCC}"
echo "PIPELINE_PATH        : ${PIPELINE_PATH}"
echo "PREDICT_OUTPUTS      : ${PREDICT_OUTPUTS}"
echo "PREDICT_INPUTS       : ${PREDICT_INPUTS}"
echo "REMOTE_CONDA_PATH    : ${REMOTE_CONDA_PATH}"

export PYTHONPATH=${PYTHONPATH}:${PIPELINE_ROOT}:${PIPELINE_PREDIC_OCC}:${PIPELINE_PATH}
echo "PYTHONPATH           ${PYTHONPATH}"

umask 0002
