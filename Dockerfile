FROM node:6-alpine

RUN apk add --no-cache make gcc g++ python bash git
RUN npm install -g yarn
WORKDIR /var/www
ADD package.json npm-shrinkwrap.json bower.json postinstall.sh /var/www/
RUN yarn --ignore-scripts && yarn cache clean
ADD . .
RUN yarn postinstall


EXPOSE 19199

USER www-data
CMD ["node","app.js"]
