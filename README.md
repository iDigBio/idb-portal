idb-portal
==========

[![Build Status](https://travis-ci.com/iDigBio/idb-portal.svg?branch=master)](https://travis-ci.com/iDigBio/idb-portal)

Nodejs, Express, React, Leaflet, Lodash, jQuery, Browserify, Gulp

## NCE Prod Branch
This is the NCE Prod branch meaning that changes made for existing production hardware happen here.

## Install these Dependencies
- nodejs (tested up to v8.12.0)
- redis-server (tested up to 5.0.3)
- yarn (tested up to 1.12.3)
- gulp (tested up to 3.9.1)
other dependecies will be acquired via Yarn

On some popular Linux distributions, the default repos include a package named "yarn" that conflicts
with the nodejs "yarn" package that is required here. cmdtest is the wrong package.

See: https://yarnpkg.com/en/docs/install#debian-stable


## Installing
- git clone this repo
- change directory into the project root 'idb-portal/' and run these commands

To get / update node package dependencies:
```bash
$ yarn
```
1st build / update source changes
```bash
$ gulp
```

## Run website
```bash
$ yarn start
```

## View Website
In your favorite browser, ``localhost:3000``

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

## Utility Scripts

The /util directory contains various ruby and shell scripts maintaining and releasing the code.

### Darwin Core Fields

The ordering and readable labels for Darwin Core fields are maintained in a Google Docs spreadsheet. If this spreadsheet is updated the code for the dwc field dictionary needs to be updated for the client-side js.
- use /util/fields-generator.rb  to update the dictionary in /public/client/js/lib/dwc_fields.js

### Data Quality Flags

The data quality flag names and descriptions are maintained in a Google Docs spreadsheet.
- use /util/dq-flags-generator.rb to update the dictionary in /public/client/js/lib/dq_flags.js when the spreadsheet is updated

## General Code Layout/Architecture
The iDigBio portal is mostly a front-side rendered app that takes advantage of Reacts' server-side rendering to allow proper search engine crawling of content pages like Record, MediaRecord and Recordset.

-There is a template in the /app/views directory for each type of page:
  * home.html, search.html, record.html, media.html, publishers.html, recordset.html, collections.html, collection.html, tutorial.html

- Each page has a corresponding JavaScript file in the /public/client/js directory.

- All the client side JS is compiled into two files  /public/js/client.js   -> src file is /public/client/js/main.js  .    /public/js/libs.js -> src file is /public/client/libs.js

- All pages except Home and Tutorial have corresponding React components in /public/client/js/react/src.

- React components like record, media, recordset avoid using libraries like jQuery which do not work on the server side so they can be properly prerendered by the server. As such any jQuery tools used (which are only necessary for interactivity) are initialized in the their top level modules in the /public/client/js directory
after the React component has rendered in the browser. Also, these page work by requesting the API data on the server and rendering the React component to the page before its sent to the browser. The data is also rendered to the head of these pages so that the browser will do its own React component rendering once the page has loaded.

- (specimen) record pages are discovered by Google through the '/list' endpoint. This is a special endpoint not intended for public display so there are no links in the portal to it. /list pages contain links to all record objects in the iDigBio API.

- Each page has a corresponding LESS file in the /public/client/less directory. All LESS files are compiled to individual CSS files in /public/css. Each page view template contains a link to its CSS file. The CSS IS NOT compiled into one large client file like the JS code is for the entire portal.
- Each one of the corresponding page LESS files will include one or more sub files for reusable display components.

### Search Page Architecture
The Search page React component is split in various subcomponent React files kept in
/public/client/js/react/src/search/ directory that are loaded in the main React search.js file.

Any changes to the search state are communicated through the searchChange function in the search.js parent component. The searchChange function is passed to all subcomponents as a property if that subcomponent has to communicate changes to the search. This changing of search state allows the page be reactive to all input changes on the search page since changing the search state triggers a render in React.

See the Search.js   statics.defaultSearch for an example of what a search state structure looks like.

History is maintained by the searchHistory object using the localStorage API through the client/js/libs/history.js file. The searchChange function pushes changes to history through this object.

Results view tab and the advanced search features tab are kept track of in localStorage API and are maintained through the viewChange function in the search.js page component.

## Stand-alone Map module Use

The specimen map used in the portal search page is available freely for public use as a stand-alone map module in JavaScript.

Embedding the specimen map in a website is easy. The following is an example HTML code for simply adding the map to a web page.

The following code assumes you know basic HTML structure and how to use the JavaScript library jQuery.
In this example the map is initialized with the element ID of an HTML DIV tag that will contain the map.
The map is then queried for all specimens (that have a geopoint) with genus "carex" using the same query format as designed for the [iDigBio Search API Query Format](https://github.com/idigbio/idigbio-search-api/wiki/Query-Format).

```html
<html>
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
    <meta content="width=device-width,initial-scale=1.0" name="viewport">
    <title>idb map test</title>
    <link href="//www.idigbio.org/portal/css/idbmap.css" rel="stylesheet" type="text/css">
    <script src="//code.jquery.com/jquery-2.1.3.min.js"></script>
    <script src="//www.idigbio.org/portal/js/idbmap.js"></script>
    <style>
      #map{
        width:700px;
        height:500px;
        position:absolute;
      }
    </style>
    <script>
      $(document).ready(function(){
        var map = new IDBMap('map');
        map.query({"genus":"carex"})       
      })
    </script>
  </head>
  <body>
    <div id="map"></div>
  </body>
 </html>
 ```
### Map options
The example above sets the map with same options the Portal Search page uses.
The following is a list of other options that allow greater control of the map in the context of more complicated web user interactivity.

- **imageButton**: (true | false) [defaults to true] - displays the camera icon button which allows the generation of an image of the map in its current state.
- **maximizeControl** (true | false) [defaults to false] - an alternate maximize map button option that uses a modal window to maximize the map to the current size of the browser view port. This is an alternative maximize option to the FullScreen view.
- **drawControl**: (true | false) [defaults to true] - displays the rectangle and circle bounding box controls.
- **legend**: (true | false) [defaults to true] - displays the map legend in the lower left corner.
- **scale**: (true | false) [defaults to true] - displays the map scale legend in the lower right corner.
- **queryChange** (function | false) [defaults to false] - a function that is passed an [iDigBio Search API Query Format](https://github.com/idigbio/idigbio-search-api/wiki/Query-Format) object that represents a search. If this function is supplied, any alterations to the original query that produced the specimen map will be passed this updated query instead of running the query internally to update the map. Ultimately the maps public "query" method should be called to update the map. Actions that alter the original query would be drawing of a boundary box or clicking on the "set map bounds" link in a specimen pop-up window. In practice, this function is used by the Portal search page to communicate boundary box changes to the rest of search page components. Ultimately the maps public "query" method is called to update the map instead of the map calling the query method internally if the queryChange function wasn't supplied.
- **loadingControl** (true | false) [defaults to true] - displays the loading spinner in the top left side of the map when a map layer is busy rendering/loading.
- **zoomControl** (true | false) [defaults to true] - displays zoom-in and zoom-out controls.
- **fullScreenControl** (true | false) [defaults to true] - displays the full-screen control button in the top right corner. This option uses the full-screen functionality that is common in most up-to-date browsers.

The following example shows how to initialize the map with alternate options like do not display bounding draw control features or the image generation button and queryChange function for communicating query changes to outer contexts.


```js
$(function(){
    var map = new IDBMap('map',{imageButton: false, drawControl: false, queryChange: function(query){
       //do something cool with the query in your web page app then update the map
       map.query(query);
    });
});
```

### Map methods

- query(idbquery)  - takes a [iDigBio Search API Query Format](https://github.com/idigbio/idigbio-search-api/wiki/Query-Format) object as a parameter and updates the map with the results.
```js
   map.query({"specificepithet":"concolor", "genus":"puma"})
```
