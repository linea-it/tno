#!/bin/sh

YELLOW='\033[00;33m'
NO_COLOR='\033[0m'

# Se nao tiver o manage.py e a primeira vez que o container e executado, apenas abre o terminal.
if [ -e manage.py ]
then
    # Adicionar o diretório da aplicação na variavel pythonpath 
    # é necessário para que o Parsl identifique os arquivos da aplicação como libs.
    # export PYTHONPATH=$PYTHONPATH:$APP_PATH

    echo "Running Migrate to apply changes in database"
    python manage.py migrate

    echo "Running Collect Statics"
    python manage.py collectstatic --clear --noinput --verbosity 0

    # Para producao usar Gunicorn
    # Exemplo usando Gunicorn mais faltou o log no output do container.
    # echo "Starting Gunicorn"
    # gunicorn --bind 0.0.0.0:$GUNICORN_PORT \
    #     $GUNICORN_MODULE:$GUNICORN_CALLABLE \
    #     --reload

    # Usar o server do django so para desenvolvimento
    echo "Running Django with ${YELLOW} DEVELOPMENT SERVER ${NO_COLOR}, for production use Gunicorn."
    python manage.py runserver 0.0.0.0:7001

else
    /bin/bash
fi



