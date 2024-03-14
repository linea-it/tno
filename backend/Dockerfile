FROM python:3.10.9-slim

# WORKDIR /app

# If this is set to a non-empty string, Python won’t try
# to write .pyc files on the import of source modules
ENV PYTHONDONTWRITEBYTECODE=1

# Force the stdout and stderr streams to be unbuffered.
# This option has no effect on the stdin stream.
ENV PYTHONUNBUFFERED=1

# Install Packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    # gcc \
    python3-dev \
    build-essential \
    # Dependency for psycopg2-binary
    libpq-dev \
    ## cleanup
    && apt-get clean \
    && apt-get autoclean \
    && apt-get autoremove --purge  -y \
    && rm -rf /var/lib/apt/lists/*

# Install python packages
COPY requirements.txt /tmp/pip-tmp/
RUN pip --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
    && rm -rf /tmp/pip-tmp

# add user so we can run things as non-root
# https://code.visualstudio.com/remote/advancedcontainers/add-nonroot-user
ARG USERNAME=vscode
ARG USERUID=1000
ARG USERGID=1000

RUN groupadd --gid  $USERGID $USERNAME \
    && groupadd --gid 15007 linea-members \
    && groupadd -r ton --gid 15010

# Create NonRoot user and add to groups
RUN useradd --uid ${USERUID} --gid ${USERGID} --shell /bin/bash --create-home ${USERNAME} \
    && usermod -a -G 15010,15007 ${USERNAME}

RUN useradd --uid 31670 --gid 15010 -m app.tno \
    && usermod -a -G 15010,15007 app.tno

RUN mkdir -p /usr/src/app \
    /usr/src/app/django_static \
    /usr/src/app/django_static/rest_framework \
    /archive \
    /archive/tmp \
    /archive/maps \
    /archive/skybot_outputs \
    /logs \
    /.astropy/cache \
    /.config/matplotlib \
    && chown -R $USER_UID:$USER_GID \
    /usr/src/app \
    /archive \
    /logs \
    /.astropy \
    /.config \
    && chmod -R 777 /usr/src/app/django_static \
    && chmod -R g+w  \
    /archive \
    /logs \
    /.astropy \
    /.config

ENV PYTHON_PATH="/usr/src/app:$PYTHON_PATH"
ENV DJANGO_SETTINGS_MODULE=coreAdmin.settings

WORKDIR /usr/src/app
COPY . /usr/src/app

COPY --chmod=0775 ./entrypoint.sh /entrypoint.sh
COPY --chmod=0775 ./start.sh /start.sh
COPY --chmod=0775 ./start_worker.sh /start_worker.sh
COPY --chmod=0775 ./start_beat.sh /start_beat.sh
COPY --chmod=0775 ./start_flower.sh /start_flower.sh


# Switch to non-priviliged user and run app
USER $USERNAME

# NÃO adicionar o script /start.sh no entrypoint
# O /start.sh deve ser adicionado no docker-compose command.
ENTRYPOINT ["/entrypoint.sh"]
