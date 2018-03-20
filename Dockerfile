FROM node:8.3
#FROM node:8.3-slim

COPY . /src/app
WORKDIR /src/app

RUN npm install --save

COPY . .

CMD ["npm", "start"]
