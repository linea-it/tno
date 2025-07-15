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