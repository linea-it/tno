
FROM node:8.3

COPY . /src/app
WORKDIR /src/app

RUN yarn -v
RUN yarn --ignore-optional


RUN yarn run build


ENTRYPOINT /src/app/entrypoint.sh