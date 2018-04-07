FROM python:latest
MAINTAINER Glauber Costa Vila Verde <glauber.vila.verde@gmail.com>

ENV GUNICORN_PORT=7001
ENV GUNICORN_MODULE=api
ENV GUNICORN_CALLABLE=app
ENV GUNICORN_USER=gunicorn
ENV APP_PATH=/app

# Install dependencies and create runtime user.
RUN apt-get update \
    && apt-get -y install unzip \
    && apt-get -y install libaio-dev \
    && pip install --upgrade pip gunicorn

# Copy the application over into the container.
ADD . $APP_PATH

# Install Oracle Client
RUN ls $APP_PATH/oracle/

RUN mkdir /oracle \
    && unzip $APP_PATH/oracle/instantclient-basic-linux.x64-12.2.0.1.0.zip -d /oracle \
    && unzip $APP_PATH/oracle/instantclient-sdk-linux.x64-12.2.0.1.0.zip -d /oracle \
    && mv /oracle/instantclient_12_2 /oracle/instantclient \
    && ln -s /oracle/instantclient/libclntsh.so.12.2 /oracle/instantclient/libclntsh.so \
    && ln -s /oracle/instantclient/libocci.so.12.2 /oracle/instantclient/libocci.so

ENV ORACLE_HOME=/oracle/instantclient
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME

ENV OCI_HOME=/oracle/instantclient
ENV OCI_LIB_DIR=/oracle/instantclient
ENV OCI_INCLUDE_DIR=/oracle/instantclient/sdk/include


# Install  the application's dependencies.
RUN pip install -r $APP_PATH/requirements.txt

# USER $GUNICORN_USER
WORKDIR $APP_PATH
ENTRYPOINT $APP_PATH/entrypoint.sh
