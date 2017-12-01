var React = require('react')
var ReactDom = require('react-dom');
var SearchPage = require('./react/src/search');

import '@bower_components/leaflet-loading/src/Control.Loading.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import '@bower_components/leaflet.fullscreen/Control.FullScreen.css';

ReactDom.render(
    <SearchPage />,
    document.getElementById('main')
)

