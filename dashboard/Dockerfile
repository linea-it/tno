
FROM node:8.3

COPY . /src/app
WORKDIR /src/app

RUN yarn -v
RUN yarn 

COPY . .

CMD ["yarn", "start"]
