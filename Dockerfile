FROM node:8.12-alpine

ENV NODE_OPTIONS=--use-openssl-ca

RUN adduser -S www-data

RUN apk add --no-cache make gcc g++ python bash git curl openssl ca-certificates
RUN curl https://crt.sh/?d=9314791 -o /usr/local/share/ca-certificates/9314791.crt
RUN update-ca-certificates -f -v

WORKDIR /var/www
ADD . .
RUN yarn && yarn cache clean

EXPOSE 19199

CMD ["npm", "start"]
