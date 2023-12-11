FROM ubuntu:22.04

ENV NODE_OPTIONS=--use-openssl-ca



RUN apt-get update
RUN apt-get -y install make gcc g++ 2to3 python2-minimal python2 dh-python python-is-python3 bash git curl openssl nodejs npm
RUN apt-get -y install gulp redis-server
RUN npm i -g yarn@1.12.3
RUN npm install -g n
RUN n 8.12.0
RUN yarn add gulp-cli

WORKDIR /var/www
ADD . .
RUN yarn --ignore-engines && yarn cache clean

EXPOSE 3000

CMD ["yarn", "start"]
