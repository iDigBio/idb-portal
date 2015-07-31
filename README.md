idb-portal
==========

Node,Express,React,Leaflet,Lodash,jQuery


## Installing

- git clone this repo
- cd project root dir
- npm install
- npm install -G gulp bower
- bower install

## Developing in
- in the root directory run the 'gulp' command to build the react jsx transformed files and the compiled client.js files that goes int the /public/js   directory on each file save. The default task also starts a live reload server 
for automatic page and resource refresh when you save a file. The live reload requires the live reload plugin for Chrome.

- Global lib files don't build on all saves as they change rarely. Any changes to a lib file requires a run of the 'gulp libs'  command to update the libs.js file in /public/js.  See the /public/client/libs.js source file for which files are included.

- The standalone Mapper module requires the  'gulp mapper' command to update the idbmap.js file in the /public/js directory. It's source file is /public/client/idbmap.js. 

- A one time update of source files (without the active watch build dev loop) in the /public/client/less or /public/client/js directories is possible with the 'gulp build' command. 


