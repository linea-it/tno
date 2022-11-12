#!/bin/sh

YELLOW='\033[00;33m'
GREEN="\[\033[0;32m\]"
NO_COLOR='\033[0m'

# Se nao tiver o manage.py e a primeira vez que o container e executado, apenas abre o terminal.
if [ -e manage.py ]
then
    echo "Running Migrate to apply changes in database"
    python manage.py migrate

    echo "Running Collect Statics"
    python manage.py collectstatic --clear --noinput --verbosity 0

    # # Usar o server do django so para desenvolvimento
    # # echo "Running Django with ${YELLOW} DEVELOPMENT SERVER ${NO_COLOR}, for production use Gunicorn."
    # python manage.py runserver 0.0.0.0:7001

    # Para produção é necessário usar o uWSGI!
    # uWSGI para servir o app e ter compatibilidade com Shibboleth
    # https://uwsgi-docs.readthedocs.io/en/latest/WSGIquickstart.html
    # TODO: Em produção não é recomendado o auto reload. utilizar uma variavel de ambiente para ligar ou desligar esta opção.
    echo "${YELLOW}Running Django with uWSGI.${NO_COLOR}"
    uwsgi \
        --socket 0.0.0.0:8000 \
        --wsgi-file /app/coreAdmin/wsgi.py \
        --module coreAdmin.wsgi:application \
        --buffer-size=32768 \
        --processes=4 \
        --threads=2 \
        --static-map /django_static=/app/django_static \
        --py-autoreload=1 
else
    /bin/bash
fi



