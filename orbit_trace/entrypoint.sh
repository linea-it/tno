#!/bin/bash --login

echo "Running Rsync: ${PIPELINE_PREDIC_OCC}"
rsync -r /predict_occultation/ ${PIPELINE_PREDIC_OCC}/

exec "$@"
