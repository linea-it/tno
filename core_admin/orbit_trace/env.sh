export ORBIT_TRACE=/archive/tmp/singulani/tno/orbit_trace
export PYTHONPATH=$PYTHONPATH:$ORBIT_TRACE
export CONDAPATH=/home/singulani/miniconda3/bin

source $CONDAPATH/activate
conda activate tno-parsl

umask 0002
