#!/bin/bash

source $CONDAPATH/activate
conda activate py3

# Configure shared cache (directory should already exist from warming)
# CRITICAL: Workers on cluster have no internet access - cache must exist!
if [[ -n "$CACHE_DIR" ]]; then
    export XDG_CACHE_HOME=${CACHE_DIR}
    export ASTROPY_CACHE_DIR=${CACHE_DIR}/astropy

    echo "============================================================"
    echo "Worker cache configuration"
    echo "CACHE_DIR: ${CACHE_DIR}"
    echo "ASTROPY_CACHE_DIR: ${ASTROPY_CACHE_DIR}"
    echo "============================================================"

    # Verify cache directory exists and is readable
    if [[ ! -d "${ASTROPY_CACHE_DIR}" ]]; then
        echo "ERROR: Cache directory does not exist: ${ASTROPY_CACHE_DIR}"
        echo "       Cache must be warmed in entrypoint.sh before workers start!"
        exit 1
    fi

    if [[ ! -r "${ASTROPY_CACHE_DIR}" ]]; then
        echo "ERROR: Cache directory is not readable: ${ASTROPY_CACHE_DIR}"
        echo "       Check permissions on Lustre filesystem."
        exit 1
    fi

    # Verify IERS cache file exists (critical for Astropy)
    download_dir="${ASTROPY_CACHE_DIR}/download"
    if [[ -d "$download_dir" ]]; then
        # Look for IERS cache file (typically > 1MB)
        cache_file=$(find "$download_dir" -type f -size +1M 2>/dev/null | head -1)
        if [[ -n "$cache_file" ]]; then
            file_size=$(stat -c%s "$cache_file" 2>/dev/null || echo "unknown")
            echo "✓ IERS cache found: $(basename "$cache_file") (${file_size} bytes)"
            echo "✓ Cache directory is readable and contains IERS data"
        else
            echo "WARNING: Cache directory exists but no IERS file found (>1MB)"
            echo "         Workers may fail when trying to use Astropy IERS data"
        fi
    else
        echo "WARNING: Cache download directory does not exist: ${download_dir}"
        echo "         Workers may fail when trying to use Astropy IERS data"
    fi

    echo "============================================================"
else
    echo "ERROR: CACHE_DIR is not set!"
    echo "       Parsl should set this via SSHChannel envs."
    echo "       Workers cannot function without cache configuration."
    exit 1
fi

ulimit -s 100000
ulimit -u 100000
umask 0002
