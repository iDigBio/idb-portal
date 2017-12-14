
var ReactDOM = require('react-dom');
var React = require('react');
//var Map = require('./search/views/mapbox');
//window.queryBuilder = require('./search/lib/querybuilder');
var L = require('leaflet');
require('leaflet-sleep');
//provides order for sections
var RecordPage = require('./react/src/record');

ReactDOM.render(
    <RecordPage record={record} />,
    document.getElementById('react-wrapper')
) 
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

if(_.has(record.indexTerms,'geopoint')){
    $('#map').css('display','block');
   
    var base = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: 'Map data © OpenStreetMap contributors',
        minZoom: 0, 
        maxZoom: 18,
        reuseTiles: true
    });

    var point = L.latLng(record.indexTerms.geopoint);

    var map = L.map('map-box',{
        center: point,
        zoom: 5,
        layers: [base],
        scrollWheelZoom: true,
        boxZoom: false,
        sleepOpacity:.9,
        sleepTime: 5,
        wakeTime: 750
    });

    L.Icon.Default.imagePath = '/portal/vendor/leaflet/dist/images/';
    L.marker(point).addTo(map);
    //map.panTo(point).setZoom(5); 
}       


