FROM python:3.10-slim

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
    gcc \
    python3-dev \
    build-essential \
    # Dependency for psycopg2-binary
    libpq-dev \
    # libaio-dev \
    # libcfitsio-bin \
    # libsasl2-dev \
    # libldap2-dev \
    # libssl-dev \
    ## cleanup
    && apt-get clean \
    && apt-get autoclean \
    && apt-get autoremove --purge  -y \
    && rm -rf /var/lib/apt/lists/*

# Install python packages
COPY requirements.txt /tmp/pip-tmp/
RUN pip --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
    && rm -rf /tmp/pip-tmp

ARG USERNAME=tnouser
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# add user so we can run things as non-root
# https://code.visualstudio.com/remote/advancedcontainers/add-nonroot-user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && mkdir /usr/src/app /usr/src/app/django_static /archive /log \
    && chown -R $USER_UID:$USER_GID /usr/src/app /usr/src/app/django_static /archive /log

ENV PYTHONPATH="/usr/src/app:$PYTHONPATH"

WORKDIR /usr/src/app
COPY . /usr/src/app

COPY --chmod=0775 ./entrypoint.sh /entrypoint.sh
COPY --chmod=0775 ./start.sh /start.sh

# Switch to non-priviliged user and run app
USER tnouser

ENTRYPOINT ["/entrypoint.sh"]

#  Runtime Stage
# FROM python:3.10-slim

# Copy Dependencies for Python LDAP, Psql
# COPY --from=builder /usr/lib/x86_64-linux-gnu /usr/lib/x86_64-linux-gnu

# # Criar o grupo des-brazil com o mesmo id usado no linea
# RUN groupadd --gid 10000 des-brazil
# # add user so we can run things as non-root
# RUN adduser --system tnouser --gid 10000

# add user so we can run things as non-root
# RUN adduser --system tnouser 

# # Copy from builder and set ENV for venv
# COPY --from=builder /opt/venv /opt/venv
# ENV PATH="/opt/venv/bin:$PATH"

# # Set Python ENV
# ENV PYTHONUNBUFFERED=1 
# ENV PYTHONPATH="/app:$PYTHONPATH"
# # Matplotlib Config 
# ENV MPLCONFIGDIR="/tmp"

# ENV SHELL /bin/bash

# # Copy app files into container
# WORKDIR /app
# COPY . .

# # Switch to non-priviliged user and run app
# USER tnouser
# # CMD ["/app/entrypoint.sh"]
# ENTRYPOINT ./entrypoint.sh