
/*
* Collections init page:  'var collections' data is defined/embeded at top of collections.html template.
***/

import ReactDOM from 'react-dom'
import React from 'react'
import CollectionsPage from './react/src/collections'

import L from 'leaflet'
require('@bower_components/leaflet.fullscreen/Control.FullScreen.js');
require('leaflet-sleep');
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

var base = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: 'Map data © OpenStreetMap',
    minZoom: 0,
    reuseTiles: true
});

var map = L.map('map',{
    center: [47,-100],
    zoom: 3,
    minZoom: 2,
    layers: [base],
    scrollWheelZoom: true,
    boxZoom: true,
    zoomControl: true,
    worldCopyJump: true,
    fullscreenControl: true,
    fullscreenControlOptions: {
    position: "topright",
    forceSeparateButton: true
    },
    zoomControl: false,
    sleepOpacity:.9,
    sleepTime: 5
});

map.addControl(L.control.zoom({
    position: 'topright'
}));
//add mapper modal for maximize view
var cols=[],ref={};
var layer = new L.layerGroup();
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
_.each(collections,function(item){
    
    if(item.lat=="NA"){item.lat=null;}
    if(item.lon=="NA"){item.lat=null;}

    if(item.lat !== null && item.lon !== null){
        var key = item.lat+' '+item.lon;
        if(_.isUndefined(lookup[key])){
            lookup[key]= item;
        }else if(_.isArray(lookup[key])){
            lookup[key].push(item);
        }else if(_.isObject(lookup[key])){
            var multi=[_.cloneDeep(lookup[key]),item];
            delete lookup[key];
            lookup[key]=multi;
        }
    }
});


_.each(lookup,function(val,key){
    var cont = '<div class="map-popup">', m;
    if(_.isArray(val)){
        m = L.marker([val[0].lat,val[0].lon],{icon: multiIcon});
        cont+='<h5>'+val[0].institution+'</h5><div class="multi">';
        _.each(val,function(item){
            var name = _.isEmpty(item.collection.trim()) ? 'Collection' : item.collection;
            cont+='<label><a target="'+item.collection_uuid+'"href="/portal/collections/'+item.collection_uuid.replace('urn:uuid:','')+'">'+
                name+'</a></label>';
            ref[item.collection_uuid]=m;
        });
        cont+='</div>';
        cont+='<address>'+val[0].physical_address+'<br>'+val[0].physical_city+', '+val[0].physical_state+' '+
            val[0].physical_zip+'</address>';
    }else{
        cont+='<h5>'+val.institution+'</h5>';
        var name = _.isEmpty(val.collection.trim()) ? 'Collection' : val.collection;
        cont += '<label><a target="'+val.collection_uuid+'"href="/portal/collections/'+val.collection_uuid.replace('urn:uuid:','')+'">'+
            name+'</a></label><address>'+val.physical_address+'<br>'+val.physical_city+', '+val.physical_state+' '+
        val.physical_zip+'</address>';
        m = L.marker([val.lat,val.lon], {icon: singleIcon});
        ref[val.collection_uuid]=m;
    }
    cont+='</div>';
    m.bindPopup(cont);
    layer.addLayer(m); 
});

//scroll to map
$('#mapScroll').click(scrollToMap);

