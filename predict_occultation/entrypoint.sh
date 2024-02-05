#!/bin/bash --login

echo "Running Rsync: ${PIPELINE_PREDIC_OCC}"
rsync -r /app/src/predict_occultation/ ${PIPELINE_PREDIC_OCC}/

exec "$@"
