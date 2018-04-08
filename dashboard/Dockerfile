
FROM node:8.3

COPY . /src/app
WORKDIR /src/app

RUN yarn install 

COPY . .

CMD ["yarn", "start"]
