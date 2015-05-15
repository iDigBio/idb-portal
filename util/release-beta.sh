#!/bin/bash

for i in {1..5}
do
    script="
    cd /var/www/node/idb-portal;
    su -c 'git checkout master' www-data;
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
    cd /var/www/node/idb-portal/public/client/js/; 
    su -c 'browserify main.js -o ../../js/app.js -t reactify' www-data; 
    cd /var/www/node/idb-portal;
    "
    ssh root@idb-portal$i-beta.acis.ufl.edu $script
done
