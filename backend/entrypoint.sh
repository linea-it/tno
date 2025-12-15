#!/bin/bash

# if any of the commands in your code fails for any reason, the entire script fails
set -o errexit
# fail exit if one of your pipe command fails
set -o pipefail
# exits if any of your variables is not set
set -o nounset

# Set umask to ensure group-writable directories (matching predict_occultation pattern)
umask ug=rwx,o=r

echo "Running Entrypoint.sh"

# Create cache directory
if [[ -z "$CACHE_DIR" ]]; then
    echo "CACHE_DIR not set, using default: /app/cache"
    export CACHE_DIR="/app/cache"
fi

echo "Cache directory: ${CACHE_DIR}"

echo "Creating cache directory: ${CACHE_DIR}"
mkdir -p ${CACHE_DIR} || echo "WARNING: Could not create cache directory ${CACHE_DIR}"
mkdir -p ${CACHE_DIR}/cartopy || echo "WARNING: Could not create cartopy subdirectory"

# Set CARTOPY_DATA_DIR environment variable
export CARTOPY_DATA_DIR=${CACHE_DIR}/cartopy

# Cache warming
echo "Cache warming for backend dependencies"

# Use Python from the container to run cache warming
if ! python3 /usr/src/app/warm_cache.py --cache-dir ${CACHE_DIR}; then
    echo "WARNING: Cache warming failed!"
    echo "Check logs: /logs/cache.log"
    echo "Backend may download Cartopy data during execution if needed"
else
    echo "Cache warming completed successfully"
fi

# Verify cartopy cache
cartopy_files=$(find ${CACHE_DIR}/cartopy -type f 2>/dev/null | wc -l)
if [ "$cartopy_files" -gt 0 ]; then
    echo "✓ Cartopy cache verified: ${cartopy_files} files found"

    # Create symlink from cartopy's default location to our cache
    CARTOPY_DEFAULT_DIR="${HOME}/.local/share/cartopy"
    if [ ! -d "${CARTOPY_DEFAULT_DIR}" ] || [ ! -L "${CARTOPY_DEFAULT_DIR}" ]; then
        mkdir -p "$(dirname "${CARTOPY_DEFAULT_DIR}")"
        if [ -d "${CARTOPY_DEFAULT_DIR}" ] && [ ! -L "${CARTOPY_DEFAULT_DIR}" ]; then
            if [ "$(find "${CARTOPY_DEFAULT_DIR}" -type f 2>/dev/null | wc -l)" -gt 0 ]; then
                cp -r "${CARTOPY_DEFAULT_DIR}"/* "${CACHE_DIR}/cartopy/" 2>/dev/null || true
            fi
            rm -rf "${CARTOPY_DEFAULT_DIR}"
        fi
        ln -sf "${CACHE_DIR}/cartopy" "${CARTOPY_DEFAULT_DIR}"
    fi
fi

# postgres_ready() {
# python << END
# import sys

# import psycopg2

# try:
#     psycopg2.connect(
#         dbname="${SQL_DATABASE}",
#         user="${SQL_USER}",
#         password="${SQL_PASSWORD}",
#         host="${SQL_HOST}",
#         port="${SQL_PORT}",
#     )
# except psycopg2.OperationalError:
#     sys.exit(-1)
# sys.exit(0)

# END
# }
# until postgres_ready; do
#     >&2 echo 'Waiting for PostgreSQL to become available...'
#     sleep 1
# done
# >&2 echo 'PostgreSQL is available'

exec "$@"
