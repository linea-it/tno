#!/bin/bash

echo "Environment: "$PARSL_ENV

if [[ "$PARSL_ENV" = "linea" ]]
then
    echo "Setup remote env at LIneA(Slurm)..."
    export EUPS_USERDATA=/tmp/`whoami`/eups
    . /mnt/eups/linea_eups_setup.sh
    setup gcc 4.9.3+1
    setup geradata 20240101+0
    setup elimina 20240101+0
    setup praia_occ_star_search_12 20240101+0
    source ${CONDAPATH}/activate
fi

conda activate py3

ulimit -s 100000
ulimit -u 100000
