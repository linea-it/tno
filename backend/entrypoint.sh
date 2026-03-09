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

# Cache warming: Cartopy baixa para o diretório padrão da biblioteca (não usamos local customizado)
echo "Cache warming for backend dependencies (Cartopy uses its default location)"

if ! python3 /usr/src/app/warm_cache.py; then
    echo "WARNING: Cache warming failed!"
    echo "Check logs: /logs/cache.log"
    echo "Backend may download Cartopy data during execution if needed"
else
    echo "Cache warming completed successfully"
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
