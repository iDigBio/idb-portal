FROM node:6-alpine

RUN adduser -S www-data

RUN apk add --no-cache make gcc g++ python bash git
WORKDIR /var/www
ADD package.json bower.json postinstall.sh .yarnclean /var/www/
RUN yarn --ignore-scripts && yarn cache clean
ADD . .
RUN yarn postinstall


EXPOSE 19199

CMD ["npm", "start"]
