export ORBIT_TRACE=/archive/des/tno/development/orbit_trace
export PYTHONPATH=$PYTHONPATH:$ORBIT_TRACE
export CONDAPATH=/home/glauber.costa/miniconda3/bin

source $CONDAPATH/activate
conda activate tno_orbit_trace

umask 0002
