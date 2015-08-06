#!/bin/bash

if [[ $# -eq 0 ]] ; then
    echo 'must specify prod or beta'
    exit 1
fi

env=$1

for i in {1..5}
do
    script="
    cd /var/www/node/idb-portal;
    npm install -g gulp;
    "
    ssh root@idb-portal$i-$env.acis.ufl.edu $script
done
