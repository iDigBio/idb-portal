
var React = require('react');
//var Map = require('./search/views/mapbox');
//window.queryBuilder = require('./search/lib/querybuilder');
var L = require('leaflet/dist/leaflet');
//provides order for sections
var RecordPage = require('./react/build/record');

React.render(
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

$('.scrollspy').scrollSpy({
    offsetTop: -155
});

if(_.has(record.indexTerms,'geopoint')){
    $('#map').css('display','block');
   
    var base = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: 'Map data © OpenStreetMap contributors',
        minZoom: 0, 
        maxZoom: 18,
        reuseTiles: true
    });

    map = L.map('map-box',{
        center: [0,0],
        zoom: 0,
        layers: [base],
        scrollWheelZoom: true,
        boxZoom: false
    });

    L.Icon.Default.imagePath = '/portal/components/leaflet/dist/images';
    var point = L.latLng(record.indexTerms.geopoint);
    L.marker(point).addTo(map);
    map.panTo(point).setZoom(5); 
}       


