idb-portal
==========

Nodejs, Express, React, Leaflet, Lodash, jQuery, Browserify, Gulp


## Installing
- install Nodejs with npm preferablly from package 
- git clone this repo
- cd to project root 'idb-portal/' and run commands
```bash
$ npm install -G gulp bower
$ bower install
$ npm install
$ node app.js NODE_ENV=prod [with credential keys]
```

## Gulp Tasks for Development

command: gulp

task: default
-  Default task for running development with a live-reload server. Builds all compiled files for both client and server every time a file is saved. The live reload requires the live reload plugin for Chrome. Chrome reloads on any file saves. 


command: gulp libs

task: libs
-  Any changes to a lib files requires a run of the 'gulp libs'  command to update the libs.js file in /public/js.  See the /public/client/libs.js source file for which files are included.


command: gulp mapper

task: mapper
- The standalone Mapper module requires the  'gulp mapper' command to update the idbmap.js file in the /public/js directory. It's source file is /public/client/idbmap.js. This command is no longer necessary since the map is also built during a release process and since it's module is included in client.js requires tree it gets updated for the client when its saved by the 'default' task. 


command: gulp buildLess

task: buildLess
- A one time LESS file compiler to the /public/css directory. This task mostly exists for the release build process so the prod/beta server can compile all the LESS files to the /public/css directory.

## Release process

- Two release script files exists for beta and prod release.
- /util/release-beta.sh   /util/release-prod.sh 

## General Code Layout/Architecture
The iDigBio portal is mostly a front-side rendered app that takes advantage of Reacts' server-side rendering to allow proper search engine crawling of content pages like Record, MediaRecord and Recordset.

-There is a template in the views directory for each type of page: 
  * home.html, search.html, record.html, media.html, publishers.html, recordset.html, collections.html, collection.html, tutorial.html

- Each page has a corresponding file in the /public/client/js directory. 

- All pages except Home and Tutorial have corresponding React components in /public/client/js/react/src. 

- React components like record, media, recordset avoid using libraries like jQuery which do not work on the server side so they can be properly prerendered by the server. As such any jQuery tools used (which are only necessary for interactivity) are initialized in the their top level modules in the /public/client/js directory
after the React component has rendered in the browser. Also, these page work by requisting the API data on the server and rendering the React component to the page before its sent to the browser. The data is also rendered to the head of these pages so that the browser will do its own React component rendering once the page has loaded.

- (specimen) record pages are discovered by google through the '/list' endpoint. This is a special endpoint not intended for public display so there are no links in the portal to it. /list pages contain links to all record objects in the iDigBio API.

- Each page has a corresponding LESS file in the /public/client/less direcotory. All LESS files are compiled to individual CSS files in /public/css. Each page view template contains a link to its CSS file. The CSS IS NOT compiled into one large client file like the JS code is for the entire portal.
- Each one of the corresponding page LESS files will include one or more sub files for reusable display components. 
  
