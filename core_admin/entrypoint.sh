#!/bin/sh

cd $APP_PATH

YELLOW='\033[00;33m'
NO_COLOR='\033[0m'


# Usar o server do django so para desenvolvimento
echo "Running Django with ${YELLOW} DEVELOPMENT SERVER ${NO_COLOR}, for production use Gunicorn."

echo "Running Migrate to apply changes in database"
python manage.py migrate

python manage.py runserver 0.0.0.0:$GUNICORN_PORT

# Para producao usar Gunicorn
# Exemplo usando Gunicorn mais faltou o log no output do container.
# echo "Starting Gunicorn"
# gunicorn --bind 0.0.0.0:$GUNICORN_PORT \
#     $GUNICORN_MODULE:$GUNICORN_CALLABLE \
#     --reload

