#!/bin/bash

echo "+++++++++++++ BEGIN POSTINSTALL +++++++++++++"

# Client Side Dependancies
node_modules/bower/bin/bower install

#compile jsx to build files for server side use of React
babel public/client/js/react/src/ --out-dir public/client/js/react/build/ --blacklist strict
#compile full client side file with jsx transforms for browser side client
node_modules/browserify/bin/cmd.js -o public/js/client.js  public/client/js/main.js -t [ babelify --blacklist strict ]
#minify client side file
node_modules/uglify-js/bin/uglifyjs -o public/js/client.js public/js/client.js

#node_modules/uglify-js/bin/uglifyjs -o public/components/underscore/underscore-min.js public/components/underscore/underscore.js
node_modules/browserify/bin/cmd.js -o public/js/libs.js  public/client/libs.js
node_modules/uglify-js/bin/uglifyjs -o public/js/libs.js public/js/libs.js

node_modules/browserify/bin/cmd.js -o public/js/idbmap.js  public/client/idbmap.js
node_modules/uglify-js/bin/uglifyjs -o public/js/idbmap.js public/js/idbmap.js

gulp buildLess

echo "+++++++++++++ END POSTINSTALL +++++++++++++"
