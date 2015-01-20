/**
 * @jsx React.DOM
 */

var React = require('react')
//var Map = require('./search/views/mapbox');
//window.queryBuilder = require('./search/lib/querybuilder');
var L = require('leaflet/dist/leaflet');
//provides order for sections
var RecordPage = require('./react/build/record');
//TODO: rewrite recordset id into page code so you can Async this
$.getJSON('//beta-search.idigbio.org/v2/view/records/'+$('#recordID').val(),function(resp){
    $.getJSON('//beta-search.idigbio.org/v2/view/recordsets/'+resp.indexTerms.recordset,function(response){
        React.renderComponent(
            <RecordPage record={resp} provider={response} />,
            document.getElementById('react-wrapper')
        ) 
        //$('.tabs .tab:first-child').trigger('click'); 
        //make map if geopoint
        if(_.has(resp.indexTerms,'geopoint')){
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
            var point = L.latLng(resp.indexTerms.geopoint);
            L.marker(point).addTo(map);
            map.panTo(point).setZoom(5); 
        }       
    })
});

