#!/bin/bash

_name=$1
_start=$2
_end=$3
_path=$4
_step=$5
_leap_sec=$6
_bsp_planetary=$7

umask 0002

echo "Enviroment Vars =========================================="

echo 'PARSL_ENV: ' $PARSL_ENV
echo 'CONDAPATH: ' $CONDAPATH
echo 'PIPELINE_PREDIC_OCC: ' $PIPELINE_PREDIC_OCC
echo 'PIPELINE_PATH: ' $PIPELINE_PATH
echo 'PYTHONPATH: ' $PYTHONPATH
echo 'PREDICT_INPUTS: ' $PREDICT_INPUTS
echo 'PREDICT_OUTPUTS: ' $PREDICT_OUTPUTS
echo "=========================================================="

TMPDIR=`echo $RANDOM | md5sum | head -c 5; echo;`
export DIR_DATA=/tmp/$TMPDIR
echo 'DIR_DATA: '$DIR_DATA

export APP_PATH_ORI=$PIPELINE_PATH
export APP_PATH=$_path/run-$TMPDIR
export PATH=$PATH:$APP_PATH_ORI/bin
echo 'APP_PATH: '$APP_PATH

mkdir $APP_PATH
cd $APP_PATH

ln -s $APP_PATH_ORI/naif0012.tls .
ln -s $APP_PATH_ORI/de440.bsp .
ln -s $APP_PATH_ORI/*.py .
ln -s $APP_PATH_ORI/praia_occ_input_template.txt .
ln -s $APP_PATH_ORI/nima_input_template.txt .

shift $#

source $PIPELINE_PATH/env_pipeline.sh

# run.sh <name> <start_date> <final_date> \
#   --path <path>
#   --step <step>
#   --leap_sec <leap_sec>
#   --bsp_planetary <bsp_planetary>
#   --refina_orbit OPCIONAL
python $PIPELINE_PREDIC_OCC/run.py $_name $_start $_end --path $_path --step $_step --leap_sec $_leap_sec --bsp_planetary $_bsp_planetary

rm $DIR_DATA

echo "Done!"
