import ReactDOM from 'react-dom';
import React from 'react';
import async from 'async';
import idbapi from './lib/idbapi';
import L from 'leaflet';
require('leaflet-sleep');
import RecordPage from './react/src/record'
import MediaPage from "./react/src/media";
import {AuthProvider} from "./react/AuthProvider";
var pubname = '';
// const initialUser = window.user ? JSON.parse(window.user) : null;
import { ChakraProvider, theme } from '@chakra-ui/react'


delete theme.styles.global
//Converted to csr due to ssr mismatch + ssr is not really needed here anyway.
ReactDOM.render(
    <ChakraProvider resetCSS={false} theme={theme}>
        <AuthProvider initialUser={user}>
            <RecordPage record={record} pubname={pubname}/>
        </AuthProvider>
    </ChakraProvider>,
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


