FROM node:8.12-alpine

ENV NODE_OPTIONS=--use-openssl-ca

RUN adduser -S www-data

RUN apk add --no-cache make gcc g++ python bash git curl ca-certificates
RUN update-ca-certificates -f -v

WORKDIR /var/www
ADD . .
RUN yarn && yarn cache clean

EXPOSE 19199

CMD ["npm", "start"]
