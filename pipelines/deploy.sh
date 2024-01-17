#!/bin/bash
set -e

conda --version

BASEDIR=`pwd`
VERSION=main
USERID=$UID
GID=`getent group ton | cut -d: -f3`

while getopts v:b:g:u: flag
do
    case "${flag}" in
        b) BASEDIR=${OPTARG} && cd $BASEDIR;;
        v) VERSION=${OPTARG};;
        g) GID=${OPTARG};;
        u) USERID=${OPTARG};;
    esac
done

URL=https://raw.githubusercontent.com/linea-it/tno/${VERSION}/pipelines

echo "BASEDIR: " $BASEDIR;
echo "URL: " $URL;
echo "UID: " $USERID;
echo "GID: " $GID;

# 1. create envs
function create_env {
    FILEENV="environment.${2}.yml"
    HASENV=`conda env list | grep ${2}`

    rm -f ${FILEENV}
    wget ${1}/${FILEENV}

    if [ -z "$HASENV" ]
    then
        conda env create -f ${FILEENV}
    else
        conda env update --file ${FILEENV} --prune
    fi
}

echo "create_env $URL py2"
create_env $URL py2
echo "create_env $URL py3"
create_env $URL py3

# 2. create docker-compose.yml
wget $URL/docker-compose.template.yml
mv docker-compose.template.yml docker-compose.yml

awk "{sub(\"_UID\",\"$USERID\")} {print}" docker-compose.yml > temp.yml && mv temp.yml docker-compose.yml
awk "{sub(\"_GID\",\"$GID\")} {print}" docker-compose.yml > temp.yml && mv temp.yml docker-compose.yml
awk "{sub(\"_HOME\",\"$HOME\")} {print}" docker-compose.yml > temp.yml && mv temp.yml docker-compose.yml
awk "{sub(\"_VERSION\",\"$VERSION\")} {print}" docker-compose.yml > temp.yml && mv temp.yml docker-compose.yml
awk "{sub(\"_BASEDIR\",\"$BASEDIR\")} {print}" docker-compose.yml > temp.yml && mv temp.yml docker-compose.yml
awk "{sub(\"_BASEDIR\",\"$BASEDIR\")} {print}" docker-compose.yml > temp.yml && mv temp.yml docker-compose.yml

# 3. create directory structure for cluster configuration
mkdir -p $BASEDIR/configs/script_dir

cat <<EOF > $BASEDIR/configs/cluster.sh
#!/bin/bash
export CONDAPATH=${CONDA_PREFIX}/bin
export PIPELINE_PREDIC_OCC=${BASEDIR}/predict_occ
export PIPELINE_PATH=${BASEDIR}/predict_occ/pipeline
export PYTHONPATH=$PYTHONPATH:$PIPELINE_PATH:$PIPELINE_PREDIC_OCC

source $CONDAPATH/activate
conda activate py3

export DB_URI=postgresql+psycopg2://untrustedprod:untrusted@desdb4.linea.gov.br:5432/prod_gavo
export PARSL_ENV=linea

ulimit -s 100000
ulimit -u 100000
umask 0002
EOF

source $BASEDIR/configs/cluster.sh

mkdir $PIPELINE_PREDIC_OCC
mkdir $BASEDIR/outputs

# 4. copy tno pipeline according to version
git clone https://github.com/linea-it/tno.git $BASEDIR && cd tno
git checkout $VERSION && cd ..
mv tno/pipelines/predict_occultation $PIPELINE_PREDIC_OCC
rm -rf tno

# 4.1 Download da BSP planetary
wget --no-verbose --show-progress \
--progress=bar:force:noscroll \ 
https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de440.bsp 

# 4.2 Download Leap Second
wget --no-verbose --show-progress \
--progress=bar:force:noscroll \
https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0012.tls 

mv de440.bsp $PIPELINE_PATH
mv naif0012.tls $PIPELINE_PATH

