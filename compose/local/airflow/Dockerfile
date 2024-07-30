FROM apache/airflow:2.8.0 as airflow

FROM airflow

ARG BUILD_ENVIRONMENT=local

# # Install apt packages
# RUN apt-get update && apt-get install --no-install-recommends -y \
#     # dependencies for building Python packages
#     build-essential \
#     # psycopg2 dependencies
#     libpq-dev

# Requirements are installed here to ensure they will be cached.
# COPY ./requirements /tmp/requirements

# # Install Python dependencies.
# RUN bash -c "pip install -r /tmp/requirements/${BUILD_ENVIRONMENT}.txt"

ENV PYTHONPATH="/opt/airflow:$PYTHONPATH"

RUN mkdir -pv "${AIRFLOW_HOME}/include" "${HOME}/workspaces" \
    && chown -R airflow:0 "${AIRFLOW_HOME}/include" "${HOME}/workspaces" \
    && chmod -R g+rw "${AIRFLOW_HOME}/include" "${HOME}/workspaces"