#!/bin/bash --login
set -o errexit
umask ug=rwx,o=r

# Verifica as variaveis de ambiente
# Usando o conda interno do container
echo "Checking mandatory environment variables."
/opt/conda/bin/python3 /app/check_enviroment.py

if [[ "$PARSL_ENV" = "linea" ]]
then
    echo "Setting up LIneA Remote envs"

    export PIPELINE_PREDIC_OCC=${REMOTE_PIPELINE_ROOT}
    export PIPELINE_PATH=${PIPELINE_PREDIC_OCC}/pipeline
    export SSHKEY=/home/app.tno/.ssh/id_rsa

    echo "Running Rsync: /app/src/ ${PIPELINE_PREDIC_OCC}"
    rsync -r /app/src/ ${PIPELINE_PREDIC_OCC}/ --exclude outputs/

    # ulimit -s 100000
    # ulimit -u 100000

    # Verifica se o miniconda está instalado no ambiente do linea.
    # Usando como base a variavel REMOTE_CONDA_PATH
    echo "Checking Remote Conda/Miniconda and python enviroment."
    remote_conda_bin="${REMOTE_PIPELINE_ROOT}/miniconda/bin/conda"
    if [ ! -f $remote_conda_bin ];
    then
        echo "Miniconda appears not to be installed."
        echo "$remote_conda_bin does not exist."
        exit 1
    fi

    echo "Checking Remote python3 enviroment."
    if $remote_conda_bin env list | grep "py3" >/dev/null 2>&1;
    then
        echo "Remote Conda py3 enviroment  already exist"
        echo "Trying to update the environment"
        $remote_conda_bin env update -f environment.py3.yml --prune
        echo "Remote Conda enviroment Updated!"
    else
        echo "Remote Conda py3 environment does not exist."
        echo "Trying to create the environment."
        source ${REMOTE_PIPELINE_ROOT}/miniconda/bin/activate
        $remote_conda_bin env create -f environment.py3.yml
        echo "Remote Conda enviroment Created!"
    fi
fi

# Baixa os arquivos bsp planetary e leap_second caso não existam.
# No build da imagem eles são baixados, mas para os devs,
# Na primeira execução eles serão sobrescritos por isso
# Essa checagem adicional.
bsp_planetary="${PIPELINE_PATH}/$BSP_PLANETARY_NAME"
if [ ! -f $bsp_planetary ];
then
    echo "BSP Planetary $BSP_PLANETARY_NAME does not exist in the pipeline path.";
    echo "Downloading $BSP_PLANETARY_NAME.";
    wget --no-verbose --show-progress \
        --progress=bar:force:noscroll \
        https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/$BSP_PLANETARY_NAME \
        -O $bsp_planetary
    echo "BSP Planetary Downloaded to: $bsp_planetary"
fi

leap_second="${PIPELINE_PATH}/$LEAP_SECOND_NAME"
if [ ! -f $leap_second ];
then
    echo "Leap Second $LEAP_SECOND_NAME does not exist in the pipeline path.";
    echo "Downloading $LEAP_SECOND_NAME.";
    wget --no-verbose --show-progress \
        --progress=bar:force:noscroll \
        https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/$LEAP_SECOND_NAME \
        -O $leap_second
    echo "Leap Second Downloaded to: $leap_second"
fi

echo "Enviroment ${PARSL_ENV} is ready!"

exec "$@"
