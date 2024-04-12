FROM ubuntu:20.04

ENV NODE_OPTIONS=--use-openssl-ca
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get -y install make gcc g++ python3 bash git curl openssl nodejs npm

RUN npm i -g yarn
RUN npm install -g n
RUN n 20.11.0

WORKDIR /var/www
ADD . .
RUN yarn && yarn cache clean

EXPOSE 19199

CMD ["npm", "start"]