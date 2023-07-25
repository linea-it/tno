FROM mcr.microsoft.com/devcontainers/python:0-3.8

ENV PYTHONUNBUFFERED 1

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    gcc \
    python3-dev \
    libaio-dev \
    build-essential \
    libcfitsio-bin \ 
    libsasl2-dev \
    libldap2-dev \
    libssl-dev \
    libpq-dev \
    gfortran \
    && apt-get clean \
    && apt-get autoclean \
    && apt-get autoremove --purge  -y \
    && rm -rf /var/lib/apt/lists/* 

# [Optional] If your requirements rarely change, uncomment this section to add them to the image.
COPY ./backend/requirements.txt /tmp/pip-tmp/
RUN pip install --upgrade pip wheel setuptools \
    && pip --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
    && rm -rf /tmp/pip-tmp

COPY --chmod=0755 ./backend/entrypoint.sh /entrypoint.sh

COPY --chmod=0775 ./backend/start.sh /start.sh

ENTRYPOINT ["/entrypoint.sh"]

