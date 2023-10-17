import React from 'react';
import ReactDom from 'react-dom';
import Search from './react/src/search'

import '@bower_components/leaflet-loading/src/Control.Loading.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import '@bower_components/leaflet.fullscreen/Control.FullScreen.css';

ReactDom.render(
    <Search />,
    document.getElementById('main')
)

