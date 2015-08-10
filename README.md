idb-portal
==========

Node,Express,React,Leaflet,Lodash,jQuery


## Installing

- git clone this repo
- cd to project root 'idb-portal/'
- npm install -G gulp bower
- npm install
- bower install
- node app.js NODE_ENV=prod [with credential keys]

## Gulp Tasks for Development

command:  gulp 
task: default
-  Default task for running development with a live-reload server. Builds all compiled files for both client and server every time a file is saved. The live reload requires the live reload plugin for Chrome. Chrome reloads on any file saves. 

command: gulp libs
task: libs
-  Any changes to a lib files requires a run of the 'gulp libs'  command to update the libs.js file in /public/js.  See the /public/client/libs.js source file for which files are included.

command: gulp mapper
task: mapper
- The standalone Mapper module requires the  'gulp mapper' command to update the idbmap.js file in the /public/js directory. It's source file is /public/client/idbmap.js. This command is no longer necessary since the map is also built during a release process and since it's module is included in client.js requires tree it gets updated for the client when its saved by the 'default' task. 

command: gulp buildLess
- A one time LESS file compiler to the /public/css directory. This task mostly exists for the release build process so the prod/beta server can compile all the LESS files to the /public/css directory.

## Release process

- Two release script files exists for beta and prod release.
- /util/release-beta.sh   /util/release-prod.sh 
