FROM python:3.11-slim


# If this is set to a non-empty string, Python won’t try
# to write .pyc files on the import of source modules
ENV PYTHONDONTWRITEBYTECODE=1

# Force the stdout and stderr streams to be unbuffered.
# This option has no effect on the stdin stream.
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Atualizar lista de pacotes e instalar dependências
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

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

RUN mkdir -p \
    /data \
    /data/outputs \
    /logs \
    && chown -R $USERUID:$USERGID /data /logs \
    && chmod -R g+w /data /logs

ENV PYTHONPATH="/app:$PYTHONPATH"

COPY . .

USER $USERNAME

CMD ["python", "main.py"]


