FROM python:3.7 as base

# Exemplo: https://sourcery.ai/blog/python-docker/

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONFAULTHANDLER 1

# Install compilation dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python-dev \
    python3-dev \
    libaio-dev \
    build-essential \
    libcfitsio-bin \
    libsasl2-dev \
    libldap2-dev \
    libssl-dev \
    vim \    
    && rm -rf /var/lib/apt/lists/*

FROM base AS python-deps
# Install pipenv 
RUN pip install pipenv

# Install python dependencies in /.venv
COPY Pipfile .
# COPY Pipfile.lock .

RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --deploy

# Gerar um arquivo requirements
# RUN pipenv lock -r > requirements.txt

FROM base AS runtime
# Copy virtual env from python-deps stage
COPY --from=python-deps /.venv /.venv
ENV PATH="/.venv/bin:$PATH"

# Criar o grupo des-brazil com o mesmo id usado no linea
RUN groupadd --gid 10000 des-brazil

# Adicionar o usuario do cristiano para rodar os jobs no condor
# TODO: talvez não seja necessário
RUN useradd --no-create-home --gid des-brazil --uid 10013 singulani

# Cria o usuario que vai rodar a aplicação e coloca este usuario no grupo des-bazil
# A aplicação vai estar no home deste usuario.
RUN useradd --create-home --gid des-brazil --uid 1000 appuser
WORKDIR /home/appuser
USER appuser

# Adiciona o path da aplicação ao pythonpath para que o parsl funcione
ENV PYTHONPATH="/home/appuser:$PYTHONPATH"

ENV PYTHONPATH="/teste_parsl:$PYTHONPATH"
ENV PYTHONPATH="/orbit_trace:$PYTHONPATH"

# TODO: Não resolveu o problema, o warning e erro continua aparecendo na imagem builded.
RUN mkdir /home/appuser/.astropy /home/appuser/.astropy/cache/ \
    && chmod 775 -R /home/appuser/.astropy/cache/

# Permissão de escrita, leitura, execução para usuarios do mesmo grupo
RUN umask 0002

COPY . .

# Copy Requirements.txt from python-deps stage
# COPY --from=python-deps /requirements.txt /home/appuser/requirements.txt


ENTRYPOINT ./entrypoint.sh