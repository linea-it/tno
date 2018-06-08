
FROM node:8.3

COPY . /src/app
WORKDIR /src/app

RUN yarn -v
RUN yarn --ignore-optional

#RUN echo "Build dashboard static files"
RUN yarn run build

#COPY . .

#CMD ["yarn", "start"]
