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
COPY Pipfile.lock .

RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --deploy

# # Gerar um arquivo requirements
# RUN pipenv lock -r > requirements.txt

FROM base AS runtime
# Copy virtual env from python-deps stage
COPY --from=python-deps /.venv /.venv
ENV PATH="/.venv/bin:$PATH"

# Create and switch to a new user
RUN useradd --create-home appuser
WORKDIR /home/appuser
USER appuser
COPY . .

ENTRYPOINT ./entrypoint.sh