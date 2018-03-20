
FROM node:8.3

COPY . /src/app
WORKDIR /src/app

RUN npm install --save

COPY . .

CMD ["npm", "start"]
