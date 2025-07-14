#!/bin/bash

echo "Environment: "$PARSL_ENV

if [[ "$PARSL_ENV" = "linea" ]]
then
    echo "Setup remote env at LIneA(Slurm)..."

    # Necessario alterar o home durante a execução no cluster
    echo "changing home directory"
    echo "Current Home: ${HOME} -> ${PIPELINE_PREDIC_OCC}"
    export HOME=${PIPELINE_PREDIC_OCC}
    echo "HOME: ${HOME}"

    echo "Changing astropy cache directory"
    export XDG_CACHE_HOME=${HOME}
    echo "XDG_CACHE_HOME: ${XDG_CACHE_HOME}"

    export EUPS_USERDATA=/tmp/`whoami`/eups
    . /opt/eups/bin/setups.sh

    echo "Eups Setup: gcc 11.1.0+0"
    setup gcc 11.1.0+0

    echo "Eups Setup: geradata 20240101+0"
    setup geradata 20240101+0

    echo "Eups Setup: elimina 20240101+0"
    setup elimina 20240101+0

    echo "Eups Setup: praia_occ_star_search_12 20240101+0"
    setup praia_occ_star_search_12 20240101+0

    echo "Setup conda environment"
    source ${CONDAPATH}/activate

    ulimit -s 100000
    ulimit -u 100000

    echo "Setup environment at LineA done."
fi

conda activate py3
