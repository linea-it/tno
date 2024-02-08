#!/bin/bash --login

echo "Running Rsync: ${PIPELINE_PREDIC_OCC}"
rsync -r /app/src/predict_occultation/ ${PIPELINE_PREDIC_OCC}/


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
