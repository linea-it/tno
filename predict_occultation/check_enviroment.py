import os
import sys

# Principais variaveis de ambiente
# - PARSL_ENV=linea
# - REMOTE_PIPELINE_ROOT=/lustre/t1/scratch/users/app.tno/tno_testing
# - PIPELINE_PATH=/lustre/t1/scratch/users/app.tno/tno_testing/predict_occultation/pipeline
# - PREDICT_OUTPUTS=/lustre/t1/scratch/users/app.tno/tno_testing/outputs/predict_occultation
# - DB_CATALOG_URI=
# - DB_ADMIN_URI=

#  Variaveis obrigatórias independente do ambiente
if "PARSL_ENV" not in os.environ:
    sys.exit("It is necessary to configure the PARSL_ENV in docker-compose.yml")

if "DB_CATALOG_URI" not in os.environ:
    sys.exit("It is necessary to configure the DB_CATALOG_URI in docker-compose.yml")

if "DB_ADMIN_URI" not in os.environ:
    sys.exit("It is necessary to configure the DB_ADMIN_URI in docker-compose.yml")

if "PREDICT_OUTPUTS" not in os.environ:
    sys.exit("It is necessary to configure the PREDICT_OUTPUTS in docker-compose.yml")

parsl_env = os.getenv("PARSL_ENV")

if parsl_env == "linea":
    # Variaveis obrigatórias para uso no Ambiente Linea.
    if "REMOTE_PIPELINE_ROOT" not in os.environ:
        sys.exit(
            f"It is necessary to configure the REMOTE_PIPELINE_ROOT in docker-compose.yml"
        )
