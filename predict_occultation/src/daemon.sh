#!/bin/bash --login

set -o errexit
set -o pipefail

source /app/src/env.sh

# echo "Starting the daemon"
# while true; do python /app/src/run_daemon.py ; sleep 30; done

# Gera timestamp formatado para os logs
timestamp() {
    date +"%Y-%m-%d %H:%M:%S"
}


echo "$(timestamp) - Starting daemon..."

# Loop 0 - Cache update (every 12 hours = 43200 seconds)
(
    while true; do
        echo "$(timestamp) - [Cache Update] - Checking and updating cache if needed..."
        if [[ -n "$CACHE_DIR" ]]; then
            python3 /app/src/warm_cache.py --cache-dir ${CACHE_DIR} || true
        fi
        sleep 43200  # 12 hours
    done
) >> /app/logs/cache_update.log 2>&1 &

# Loop 1 - submit_worker
(
    while true; do
        echo "$(timestamp) - [Submit Worker] - Running"
        python /app/src/submit_worker.py
        sleep 30
    done
) &


# Loop 2 - ingest_worker
(
    while true; do
        echo "$(timestamp) - [Ingest Worker] - Running"
        python /app/src/ingest_worker.py
        sleep 30
    done
) >> /app/logs/ingest_worker.log 2>&1 &

# Exemplo redirecionando o log para o arquivo e terminal
# ) 2>&1 | tee -a /app/logs/submit_worker.log &


# Loop 3 - complete_worker
(
    while true; do
        echo "$(timestamp) - [Complete Worker] - Running"
        python /app/src/complete_worker.py
        sleep 30
    done
) >> /app/logs/complete_worker.log 2>&1 &

# Loop de rotação de logs a cada 1 hora
(
    while true; do
        /app/src/rotate_logs.sh
        sleep 3600
    done
) &


# Espera indefinidamente para que o container não finalize
wait
