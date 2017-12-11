FROM node:6-alpine

RUN adduser -S www-data

RUN apk add --no-cache make gcc g++ python bash git
WORKDIR /var/www
ADD . .
RUN yarn && yarn cache clean

EXPOSE 19199

CMD ["npm", "start"]
