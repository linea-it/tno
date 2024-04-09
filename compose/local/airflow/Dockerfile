FROM apache/airflow:2.8.0 as airflow

FROM airflow
ARG BUILD_ENVIRONMENT=local


USER root
# Install apt packages
RUN apt-get update && apt-get install --no-install-recommends -y \
    # dependencies for building Python packages
    build-essential \
    # psycopg2 dependencies
    libpq-dev \
    # java dependencies
    software-properties-common \
    python3-launchpadlib \
    wget

RUN apt-get update && apt-get install --no-install-recommends -y \
    openjdk-17-jdk
# JAVA Envs
ENV JAVA_HOME='/usr/lib/jvm/java-17-openjdk-amd64'
ENV PATH=$PATH:$JAVA_HOME/bin

# RUN mkdir -p /etc/apt/keyrings \
#     && wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | tee /etc/apt/keyrings/adoptium.asc \
#     && echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list \
#     && apt update \
#     && apt install -y temurin-8-jdk


# # JAVA Envs
# ENV JAVA_HOME='/usr/lib/jvm/temurin-8-jdk-amd64'
# ENV PATH=$PATH:$JAVA_HOME

# Install SPARK
RUN curl -O https://dlcdn.apache.org/spark/spark-3.5.1/spark-3.5.1-bin-hadoop3.tgz \
    && tar xvf spark-3.5.1-bin-hadoop3.tgz \
    && mv spark-3.5.1-bin-hadoop3 /opt/spark \
    && rm spark-3.5.1-bin-hadoop3.tgz \
    && export SPARK_HOME=/opt/spark \
    && export PATH=$PATH:$SPARK_HOME/bin:$SPARK_HOME/sbin 
# && export PYTHONPATH=$(ZIPS=("$SPARK_HOME"/python/lib/.zip); IFS=:; echo "${ZIPS[]}"):$PYTHONPATH

# SPARK Envs
# ENV SPARK_HOME=/opt/spark
# ENV PATH=$PATH:$SPARK_HOME/bin:$SPARK_HOME/sbin
# ENV PYTHONPATH=$(ZIPS=("$SPARK_HOME"/python/lib/.zip); IFS=:; echo "${ZIPS[]}"):$PYTHONPATH

USER airflow

# Requirements are installed here to ensure they will be cached.
COPY ./airflow/requirements /tmp/requirements

# Install Python dependencies.
RUN bash -c "pip install -r /tmp/requirements/${BUILD_ENVIRONMENT}.txt" 

ENV PYTHONPATH="/opt/airflow:$SPARK_HOME/python/lib:$PYTHONPATH"

RUN mkdir -pv "${AIRFLOW_HOME}/include" "${HOME}/workspaces" \
    && chown -R airflow:0 "${AIRFLOW_HOME}/include" "${HOME}/workspaces" \
    && chmod -R g+rw "${AIRFLOW_HOME}/include" "${HOME}/workspaces"

