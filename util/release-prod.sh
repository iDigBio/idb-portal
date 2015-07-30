#!/bin/bash

for i in {1..5}
do
    script="
    cd /var/www/node/idb-portal;
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
            if [ $val = '-j' ]
            then
                script+="npm install -g react-tools;"
            fi
            if [ $val = '-i' ]
            then
                script+="su -c 'npm install' www-data;"
            fi
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
                script+="su -c 'bower update' www-data;"
            fi
            if [ $val = '-r' ]
            then
                script+="supervisorctl restart idigbio-portal-service;"
            fi
        done
    fi
    script+="
    cd /var/www/node/idb-portal;
    supervisorctl restart idigbio-portal-service;
    "
    ssh root@idb-portal$i-prod.acis.ufl.edu $script
done
