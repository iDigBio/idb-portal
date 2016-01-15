FROM nodesource/trusty:5.3.0

RUN npm install -g bower gulp babel@^5.0
ADD package.json package.json
ADD npm-shrinkwrap.json npm-shrinkwrap.json
ADD bower.json bower.json
RUN npm install --ignore-scripts
RUN bower install --allow-root
ADD . .
RUN ./postinstall.sh

EXPOSE 19199

CMD ["node","app.js"]