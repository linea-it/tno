#!/bin/bash
# export CONDAPATH=$SLURM_REMOTE_DIR/miniconda/bin
#export PIPELINE_PREDIC_OCC=/lustre/t1/scratch/users/app.tno/tno_testing/predict_occultation
#export PIPELINE_PATH=/lustre/t1/scratch/users/app.tno/tno_testing/predict_occultation/pipeline
#export PYTHONPATH=$PYTHONPATH:$PIPELINE_PATH:$PIPELINE_PREDIC_OCC

source $CONDAPATH/activate
conda activate py3

# export PIPELINE_PREDIC_OCC=$SLURM_REMOTE_DIR/predict_occultation
# export PIPELINE_PATH=$SLURM_REMOTE_DIR/predict_occultation/pipeline
# export PYTHONPATH=$SLURM_REMOTE_DIR:$PIPELINE_PREDIC_OCC:$PIPELINE_PATH:$PYTHONPATH

# export DB_CATALOG_URI=postgresql+psycopg2://untrustedprod:untrusted@desdb4.linea.gov.br:5432/prod_gavo
# export PARSL_ENV=linea

ulimit -s 100000
ulimit -u 100000
umask 0002
