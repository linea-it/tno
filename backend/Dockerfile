FROM python:3.10-slim as builder

WORKDIR /app

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

# Add venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install python packages
COPY requirements.txt .
RUN pip install --upgrade pip wheel  && \
    pip install --disable-pip-version-check --no-cache-dir -r requirements.txt

#  Runtime Stage
FROM python:3.10-slim

# Copy Dependencies for Python LDAP, Psql
COPY --from=builder /usr/lib/x86_64-linux-gnu /usr/lib/x86_64-linux-gnu

# # Criar o grupo des-brazil com o mesmo id usado no linea
# RUN groupadd --gid 10000 des-brazil
# # add user so we can run things as non-root
# RUN adduser --system tnouser --gid 10000

# add user so we can run things as non-root
RUN adduser --system tnouser 

# Copy from builder and set ENV for venv
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set Python ENV
ENV PYTHONUNBUFFERED=1 
ENV PYTHONPATH="/app:$PYTHONPATH"
# Matplotlib Config 
ENV MPLCONFIGDIR="/tmp"

ENV SHELL /bin/bash

# Copy app files into container
WORKDIR /app
COPY . .

# Switch to non-priviliged user and run app
USER tnouser
# CMD ["/app/entrypoint.sh"]
ENTRYPOINT ./entrypoint.sh