#!/bin/bash

set -x

# Do not execute directly, execute via npm postinstall / yarn run postinstall.

echo "+++++++++++++ BEGIN POSTINSTALL +++++++++++++"

if [ ! -d public/js ]; then
    mkdir public/js
fi

#compile jsx to build files for server side use of React
babel public/client/js/react/src/ --out-dir public/client/js/react/build/ --blacklist strict && \
#compile full client side file with jsx transforms for browser side client
browserify -o public/js/client.js  public/client/js/main.js -g browserify-css -t [ babelify --presets "env" "react" ] && \
#minify client side file
uglifyjs -o public/js/client.js public/js/client.js && \

#node_modules/uglify-js/bin/uglifyjs -o public/components/underscore/underscore-min.js public/components/underscore/underscore.js
browserify -o public/js/libs.js  public/client/libs.js && \
uglifyjs -o public/js/libs.js public/js/libs.js && \

browserify -o public/js/idbmap.js  public/client/idbmap.js && \
uglifyjs -o public/js/idbmap.js public/js/idbmap.js && \

gulp buildLess && \

echo "+++++++++++++ END POSTINSTALL +++++++++++++"
