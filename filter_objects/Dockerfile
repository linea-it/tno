FROM python:latest
MAINTAINER Glauber Costa Vila Verde <glauber.vila.verde@gmail.com>

ENV GUNICORN_PORT=7003
ENV GUNICORN_MODULE=api
ENV GUNICORN_CALLABLE=app
ENV APP_PATH=/app

# Install dependencies and create runtime user.
RUN apt-get update \
    && apt-get -y install unzip \
    && apt-get -y install libaio-dev python3-dev \
    && pip install --upgrade pip gunicorn \
    && pip install flask \
        flask_sqlalchemy \
         flask-cors \
         requests \
         SQLAlchemy \
         psycopg2-binary

 RUN pip install numpy \
          astropy


# Copy the application over into the container.
COPY . $APP_PATH

# Install  the application's dependencies.
RUN pip install -r $APP_PATH/requirements.txt

WORKDIR $APP_PATH
ENTRYPOINT $APP_PATH/entrypoint.sh
