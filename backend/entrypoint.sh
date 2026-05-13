#!/bin/bash

# if any of the commands in your code fails for any reason, the entire script fails
set -o errexit
# fail exit if one of your pipe command fails
set -o pipefail
# exits if any of your variables is not set
set -o nounset

umask ug=rwx,o=r

echo "Running Entrypoint.sh"

# Cache warming: Cartopy e Astropy IERS
echo "Cache warming for backend dependencies (Cartopy uses its default location)"

if ! python3 /usr/src/app/warm_cache.py; then
    echo "WARNING: Cache warming failed!"
    echo "Check logs: /logs/cache.log"
    echo "Backend may download Cartopy data during execution if needed"
else
    echo "Cache warming completed successfully"
fi

exec "$@"
