#!/bin/bash

set -x

# Do not execute directly, execute via npm postinstall / yarn run postinstall.

echo "+++++++++++++ BEGIN POSTINSTALL +++++++++++++"

if [ ! -d public/js ]; then
    mkdir public/js
fi

gulp

echo "+++++++++++++ END POSTINSTALL +++++++++++++"
