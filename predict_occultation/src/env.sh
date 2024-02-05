#!/bin/bash --login

echo "Activating py3 environment" 
conda activate py3

export PYTHONPATH=${PYTHONPATH}:${PIPELINE_ROOT}:${PIPELINE_PREDIC_OCC}:${PIPELINE_PATH}

ulimit -s 100000
ulimit -u 100000
umask 0002