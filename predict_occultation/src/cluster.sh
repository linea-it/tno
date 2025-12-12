#!/bin/bash

source $CONDAPATH/activate
conda activate py3

# Propagate monitoring environment variables if they exist
# These are passed via Parsl envs dict and need to be exported for Python processes
if [ -n "${BENCHMARK_ENABLED:-}" ]; then
    export BENCHMARK_ENABLED="${BENCHMARK_ENABLED}"
fi
if [ -n "${RESOURCE_MONITOR:-}" ]; then
    export RESOURCE_MONITOR="${RESOURCE_MONITOR}"
fi

ulimit -s 100000
ulimit -u 100000
umask 0002
