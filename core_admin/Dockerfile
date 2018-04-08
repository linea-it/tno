FROM python:3.6

MAINTAINER Glauber Costa Vila Verde <glauber.vila.verde@gmail.com>

ENV GUNICORN_PORT=7001
ENV GUNICORN_MODULE=coreAdmin.wsgi
ENV GUNICORN_CALLABLE=application
ENV APP_PATH=/app

RUN mkdir /app

WORKDIR /app

ADD requirements.txt /app

RUN pip install -r requirements.txt

COPY . /app

WORKDIR $APP_PATH
ENTRYPOINT $APP_PATH/entrypoint.sh