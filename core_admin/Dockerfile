FROM python:3.6

MAINTAINER Glauber Costa Vila Verde <glauber.vila.verde@gmail.com>

ENV GUNICORN_PORT=7001
ENV GUNICORN_MODULE=coreAdmin.wsgi
ENV GUNICORN_CALLABLE=application
ENV APP_PATH=/app

#RUN apt-get update && apt-get install -y --no-install-recommends \
RUN apt-get update && apt-get install -y  \
    vim \
    expect \
    telnet \
    ftp \
    libcfitsio-bin \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir $APP_PATH

WORKDIR $APP_PATH

ADD requirements.txt $APP_PATH

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

COPY . $APP_PATH

WORKDIR $APP_PATH
ENTRYPOINT $APP_PATH/entrypoint.sh