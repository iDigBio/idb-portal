import ReactDOM from 'react-dom';
import React from 'react';
import async from 'async';
import idbapi from './lib/idbapi';
import L from 'leaflet';
require('leaflet-sleep');
import RecordPage from './react/src/record'
import MediaPage from "./react/src/media";
const { glify } = require('leaflet.glify');

var pubname = '';
//Converted to csr due to ssr mismatch + ssr is not really needed here anyway.
ReactDOM.render(
    <RecordPage record={record} pubname={pubname}/>,
    document.getElementById('react-wrapper')
);
// async.parallel([
//     function(callback){
//         idbapi.publishers({"pq":{"uuid":record.attribution.publisher}},function(resp){
//             resp.items.forEach(function(item){
//             pubname = item.data.name;
//             })
//             callback();
//         });
//     }
// ],function(error){
//     setTimeout(() => {
//         ReactDOM.hydrate(
//             <RecordPage record={record} pubname={pubname}/>,
//             document.getElementById('react-wrapper')
//         );
//     }, [2000])
//     ReactDOM.render(
//         <RecordPage record={record} pubname={pubname}/>,
//         document.getElementById('react-wrapper')
//     );
//
//
// })

//$('.tabs .tab:first-child').trigger('click'); 
//make map if geopoint

$('#side-nav-list').affix({
    offset: {
        top: function(){
            return $('#summary').offset().top - $(window).scrollTop();
        }
    }
})

// $('.scrollspy').scrollSpy({
//     offsetTop: -205
// });

if (_.has(record.indexTerms, 'geopoint')) {
    $('#map').show();                            // same as css display:block;
  
    // ----  create the base layer and map  ----
    const point = L.latLng(record.indexTerms.geopoint);
  
    const map = L.map('map‑box', {
      center: point,
      zoom  : 5,
      layers: [
        L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data © OpenStreetMap contributors',
          minZoom: 0,
          maxZoom: 18,
          reuseTiles: true
        })
      ],
      scrollWheelZoom: true,
      boxZoom: false,
      sleepOpacity: 0.9,
      sleepTime  : 5,
      wakeTime   : 750
    });
  
    // ----  draw with WebGL  ----
    // simplest form: an array of [lat,lng] pairs
    const glData = [[point.lat, point.lng]];
  
    L.glify.points({
      map   : map,            // required
      data  : glData,         // required
      size  : 12,             // px
      color : 'orange',       // string | function | {r,g,b,a}
      opacity: 0.8
    });                       // returns an L.glify.Points instance
  
    // If you only need the WebGL points layer, you can remove the classic marker:
    // L.marker(point).addTo(map);
  }   


