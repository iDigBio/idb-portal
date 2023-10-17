/*
*MAIN iDigBio Portal client-side app file.
*this provides initial routing for per page app execution.
*****/

import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import 'jquery-ui/themes/base/all.css';


function loadPage(){
    var path = url(1) == 'portal' ? url(2) : url(1);
    
    switch(path){
        case '':
            require('./home');
            break;
        case 'search':
            require('./search')
            break;
        case 'tutorial':
            require('./tutorial');
            break;
        case 'publishers':
            require('./publishers');
            break;
        case 'portalstats':
            require('./stats');
            break;
        case 'recordsets':
            require('./recordset');
            break;
        case 'records':
            require('./record');
            break;
        case 'mediarecords':
            require('./media');
            break;
        case 'collections':
            if(url(-1) !=='collections') {
                require('./collection');
            } else {
                require('./collections');
            }
            break;
        default:
            require('./home');
            break;
    }
}

$(function() {
    //warning to old IE browsers
    if ($('html').is('.ie-old')) {
        alert('iDigBio Portal will not work on this browser properly. Please update Internet Explorer to version 10 or newer');
    }
    //set class for mac browsers for webkit css
    if(navigator.platform.toLowerCase().indexOf('mac') > -1) {
        $('html').addClass('mac');
    }
    //if errors occur on page load try once to clear localStore and refresh
    try {
        loadPage();
        localStorage.removeItem('reloaded');
    } catch (e) {
        if(localStorage) {
            console.warn(e);
            if(localStorage.getItem('reloaded') === null) {
                localStorage.clear();
                localStorage.setItem('reloaded', 'true');
                location.reload();
            } else {
                localStorage.removeItem('reloaded');
            }
        }
    }
});
