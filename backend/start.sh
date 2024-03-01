#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Running Migrate to apply changes in database"
cd /usr/src/app
python manage.py migrate
python manage.py migrate django_celery_results

echo "Running Collect Statics"
python manage.py collectstatic --clear --noinput --verbosity 0

# uWSGI para servir o app e ter compatibilidade com Shibboleth
# https://uwsgi-docs.readthedocs.io/en/latest/WSGIquickstart.html
# TODO: Em produção não é recomendado o auto reload. utilizar uma variavel de ambiente para ligar ou desligar esta opção.
echo "Running Django with uWSGI"
uwsgi \
    --socket 0.0.0.0:8000 \
    --wsgi-file /usr/src/app/coreAdmin/wsgi.py \
    --module coreAdmin.wsgi:application \
    --buffer-size=32768 \
    --processes=${DJANGO_UWSGI_WORKER_CONCURRENCY:-4} \
    --threads=${DJANGO_UWSGI_WORKER_CONCURRENCY:-4}\
    --http-timeout=120 \
    --static-map /django_static=/usr/src/app/django_static \
    --py-autoreload=1
