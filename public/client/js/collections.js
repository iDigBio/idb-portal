
/*
* Collections init page:  'var collections' data is defined/embeded at top of collections.html template.
***/

import ReactDOM from 'react-dom'
import React from 'react'
import CollectionsPage from './react/src/collections'

import L from 'leaflet'
require('@bower_components/leaflet.fullscreen/Control.FullScreen.js');
require('leaflet-sleep');
const { glify } = require('leaflet.glify');

var triggerPopup = function(id){
    scrollToMap();
    map.setView(ref[id]._latlng).setZoomAround(ref[id]._latlng,8)
    ref[id].openPopup();
}
var scrollToMap = function(){
    $('html, body').animate({
        scrollTop: $("#map").offset().top-40
    }, 700);
}

ReactDOM.render(<CollectionsPage data={collections} openMapPopup={triggerPopup} />, document.getElementById('datatable'));

const base = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: 'Map data © OpenStreetMap',
    minZoom : 0,
    reuseTiles: true
  });
  
  const map = L.map('map',{
    center:[47,-100],
    zoom:3,
    minZoom:2,
    layers:[base],
    scrollWheelZoom:true,
    boxZoom:true,
    zoomControl:true,
    worldCopyJump:true,
    fullscreenControl:true,
    fullscreenControlOptions:{ position:"topright", forceSeparateButton:true },
    zoomControl:false,          // ← you later add one manually
    sleepOpacity:.9,
    sleepTime:5
  });
  
  map.addControl(L.control.zoom({ position:'topright' }));
  
const layer = L.layerGroup().addTo(map);
//add mapper modal for maximize view
var cols=[],ref={};
//var layer = new L.layerGroup();
layer.addTo(map);

L.Icon.Default.imagePath = '/portal/vendor/leaflet/dist/images';

var multiIcon = L.icon({
    iconUrl: '/portal/img/mapmarker.png',
    iconSize: [22, 23],
    iconAnchor: [10, 20],
    popupAnchor: [1, -9],
    shadowUrl: '/portal/vendor/leaflet/dist/images/marker-shadow.png',
    shadowSize: [30,22],
    shadowAnchor: [9,20] 
});

var singleIcon = L.icon({
    iconUrl: '/portal/vendor/leaflet/dist/images/marker-icon.png',
    iconSize: [15, 22],
    iconAnchor: [10, 20],
    popupAnchor: [-3, -9],
    shadowUrl: '/portal/vendor/leaflet/dist/images/marker-shadow.png',
    shadowSize: [30,22],
    shadowAnchor: [12,20]    
});

//add map points
var lookup={};
const coords   = [];   // WebGL will draw these
const payloads = [];   // keep a pointer to the original objects for pop‑ups

_.each(collections, item => {
  if (item.lat === "NA" || item.lon === "NA") return;
  const lat = +item.lat, lon = +item.lon;

  const key = lat + ' ' + lon;
  lookup[key] = lookup[key] || [];
  lookup[key].push(item);
});

_.each(lookup, val => {
  const first = _.isArray(val) ? val[0] : val;
  coords.push([+first.lat, +first.lon]);
  payloads.push(val);          // same index as coords[]
});

L.glify.points({
    map ,                  // attach to this map   :contentReference[oaicite:0]{index=0}
    data : coords,         // array of [lat,lng]
    size : 10,             // pixel radius
    color: i =>
      Array.isArray(payloads[i])               // multi‑collection → orange
        ? { r:1, g:0.5, b:0, a:1 }
        : { r:0, g:0.4, b:1, a:1 },            // single‑collection → blue
  
    // replicate your pop‑up HTML
    click : (e, feature) => {
      const i   = coords.findIndex(p => p[0] === feature[0] && p[1] === feature[1]);
      const val = payloads[i];
  
      let html = '<div class="map-popup">';
      if (Array.isArray(val)) {
        html += `<h5>${val[0].institution}</h5><div class="multi">`;
        val.forEach(item => {
          const label = item.collection.trim() || 'Collection';
          html += `<label><a href="/portal/collections/${item.collection_uuid.replace('urn:uuid:','')}"
                             target="${item.collection_uuid}">${label}</a></label>`;
        });
        html += '</div>';
      } else {
        const label = val.collection.trim() || 'Collection';
        html += `<h5>${val.institution}</h5>
                 <label><a href="/portal/collections/${val.collection_uuid.replace('urn:uuid:','')}"
                           target="${val.collection_uuid}">${label}</a></label>`;
      }
      html += '</div>';
  
      L.popup().setLatLng(feature).setContent(html).openOn(map);
    }
  });
  
//scroll to map
$('#mapScroll').click(scrollToMap);

