/**
 * @jsx React.DOM
 */

var React = require('react')
var L = require('leaflet/dist/leaflet');
var SearchPage = require('./react/build/search');

React.renderComponent(
    <SearchPage key={'hello'}/>,
    document.getElementById('main')
)

var base = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: 'Map data © OpenStreetMap contributors',
    minZoom: 0, 
    //maxZoom: 19,
    reuseTiles: true
});

var map = L.map('map',{
    center: [0,0],
    zoom: 0,
    layers: [base],
    scrollWheelZoom: true,
    boxZoom: false
});


