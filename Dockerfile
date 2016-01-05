FROM nodesource/trusty:0.10.41

RUN npm -g install npm@latest
RUN npm install -g bower gulp babel-cli
ADD package.json package.json
ADD npm-shrinkwrap.json npm-shrinkwrap.json
ADD bower.json bower.json
RUN npm install --ignore-scripts
RUN bower install --allow-root
ADD . .
RUN ./postinstall.sh

EXPOSE 19199

CMD ["node","app.js"]