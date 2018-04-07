FROM python:3.6

RUN mkdir /app

WORKDIR /app

ADD requirements.txt /app

RUN pip install -r requirements.txt

COPY . /app
