#!/bin/bash

echo "+++++++++++++ BEGIN POSTINSTALL +++++++++++++"

# Client Side Dependancies
node_modules/bower/bin/bower install

# Build Leaflet
cd public/components/leaflet
npm install
cd ../../..

# Build Knockout
#cd public/components/knockout/
#npm install
#cd ../../..

node_modules/browserify/bin/cmd.js -o public/js/client.js  public/client/js/main.js -t reactify

node_modules/uglify-js/bin/uglifyjs -o public/js/client.js public/js/client.js

#node_modules/uglify-js/bin/uglifyjs -o public/components/underscore/underscore-min.js public/components/underscore/underscore.js

echo "+++++++++++++ END POSTINSTALL +++++++++++++"
