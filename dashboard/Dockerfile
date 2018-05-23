
FROM node:8.3

COPY . /src/app
WORKDIR /src/app

RUN yarn -v
RUN yarn --ignore-optional

COPY . .

CMD ["yarn", "start"]
