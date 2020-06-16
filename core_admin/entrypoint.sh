#!/bin/sh

cd $APP_PATH

YELLOW='\033[00;33m'
NO_COLOR='\033[0m'

# Se nao tiver o manage.py e a primeira vez que o container e executado, apenas abre o terminal.
ls
if [ -e manage.py ]
then
    # Usar o server do django so para desenvolvimento
    # echo "Running Django with ${YELLOW} DEVELOPMENT SERVER ${NO_COLOR}, for production use Gunicorn."

    echo "Running Migrate to apply changes in database"
    python manage.py migrate

    echo "Running Collect Statics"
    python manage.py collectstatic --clear --noinput --verbosity 0

    # python manage.py runserver 0.0.0.0:7001

    # Dar Permissao aos arquivos de log
    chmod -R 775 $LOG_DIR

    # Para producao usar uWSGI para servir o app e ter compatibilidade com Shibboleth
    # https://uwsgi-docs.readthedocs.io/en/latest/WSGIquickstart.html
    uwsgi --socket 0.0.0.0:7001 --wsgi-file $APP_PATH/coreAdmin/wsgi.py --py-autoreload 1 --static-map /django_static/rest_framework/=$APP_PATH/static/rest_framework --static-map /django_static/admin/=$APP_PATH/static/admin
else
    /bin/bash
fi



