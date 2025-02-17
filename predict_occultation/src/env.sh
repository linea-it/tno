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
