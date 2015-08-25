#!/bin/bash

for i in {1..5}
do
    script="
    cd /var/www/node/idb-portal;
    su -c 'git reset --hard' www-data;
    su -c 'git checkout prod' www-data;
    su -c 'git pull' www-data;
    "
    count=$#
    st=1
    if [ "$count" > "$st" ]
    then
        actual=$(($count-1))
        for ((s=1;s<=$count;s++))
        do
            eval val="$"$s
            if [ $val = '-ib' ]
            then
                script+="npm install -g bower;"
            fi
            if [ $val = '-ir' ]
            then
                script+="npm install -g browserify;"
            fi
            if [ $val = '-b' ]
            then
                script+="su -c 'bower install' www-data;"
            fi
            if [ $val = '-u' ]
            then
                script+="su -c 'bower cache clean' www-data;"
                script+="su -c 'bower update' www-data;"
            fi
        done
    fi
    script+="
    cd /var/www/node/idb-portal;
    su -c 'npm install' www-data;
    supervisorctl restart idigbio-portal-service;
    "
    ssh root@idb-portal$i-prod.acis.ufl.edu $script
done
