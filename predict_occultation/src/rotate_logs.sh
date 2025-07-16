#!/bin/bash

LOG_DIR="/app/logs"
SIZE_LIMIT=$((1024 * 1024))  # 1MB

# Gera timestamp formatado para os logs
timestamp() {
    date +"%Y-%m-%d %H:%M:%S"
}

for log_file in "$LOG_DIR"/*.log; do
    [ -e "$log_file" ] || continue  # pula se não houver logs

    size=$(stat -c%s "$log_file")
    base_name=$(basename "$log_file")
    rotated="$LOG_DIR/${base_name}.1"

    if [ "$size" -gt "$SIZE_LIMIT" ]; then
        echo "$(timestamp) - Rotating $log_file (size: $size bytes)"

        # Move o log atual para .1 (sobrescreve o anterior)
        mv "$log_file" "$rotated"

        # Cria novo log vazio
        touch "$log_file"
        chmod 644 "$log_file"
    # else
    #     echo "$(timestamp) - Skipping $log_file (size: $size bytes < 1MB)"
    fi
done


# for log_file in "$LOG_DIR"/*.log; do
#     [ -e "$log_file" ] || continue  # pula se não houver arquivos

#     base_name=$(basename "$log_file")
#     rotated="$LOG_DIR/${base_name}.1"

#     echo "$(date) - Rotating $log_file"

#     # Move o log atual para .1 (sobrescreve o antigo .1, se houver)
#     mv "$log_file" "$rotated"

#     # Cria arquivo novo vazio com mesmo nome do original
#     touch "$log_file"

#     # Opcional: garantir permissões (caso workers não rodem como root)
#     chmod 644 "$log_file"
# done
