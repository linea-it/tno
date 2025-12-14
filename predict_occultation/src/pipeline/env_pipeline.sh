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

    # Configure cache (CACHE_DIR should be set by Parsl via envs)
    # Fallback to shared cache in Lustre if CACHE_DIR not set (should not happen)
    if [[ -z "$CACHE_DIR" ]]; then
        # Use REMOTE_PIPELINE_ROOT if available, otherwise PIPELINE_PREDIC_OCC
        if [[ -n "$REMOTE_PIPELINE_ROOT" ]]; then
            CACHE_DIR=${REMOTE_PIPELINE_ROOT}/cache
        elif [[ -n "$PIPELINE_PREDIC_OCC" ]]; then
            CACHE_DIR=${PIPELINE_PREDIC_OCC}/cache
        else
            echo "ERROR: CACHE_DIR not set and cannot determine cache location!"
            echo "       REMOTE_PIPELINE_ROOT and PIPELINE_PREDIC_OCC are both unset."
            exit 1
        fi
        echo "WARNING: CACHE_DIR was not set by Parsl, using fallback: ${CACHE_DIR}"
    fi

    export XDG_CACHE_HOME=${CACHE_DIR}
    export ASTROPY_CACHE_DIR=${CACHE_DIR}/astropy

    # Verify cache directory exists and is readable
    if [[ ! -d "${ASTROPY_CACHE_DIR}" ]]; then
        echo "WARNING: Cache directory does not exist: ${ASTROPY_CACHE_DIR}"
        echo "         Workers may attempt to download IERS data (will fail without internet)"
    elif [[ ! -r "${ASTROPY_CACHE_DIR}" ]]; then
        echo "WARNING: Cache directory is not readable: ${ASTROPY_CACHE_DIR}"
    else
        echo "Cache directory configured: ${ASTROPY_CACHE_DIR}"
    fi

    echo "XDG_CACHE_HOME: ${XDG_CACHE_HOME}"
    echo "ASTROPY_CACHE_DIR: ${ASTROPY_CACHE_DIR}"

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
