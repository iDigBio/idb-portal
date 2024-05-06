/*
*MAIN iDigBio Portal client-side app file.
*this provides initial routing for per page app execution.
*****/

import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import 'jquery-ui/themes/base/all.css';



async function loadPage() {
    var path = url(1) == 'portal' ? url(2) : url(1);

    try {
        switch(path) {
            case '':
                await import('./home');
                break;
            case 'search':
                await import('./search');
                break;
            case 'tutorial':
                await import('./tutorial');
                break;
            case 'publishers':
                await import('./publishers');
                break;
            case 'portalstats':
                await import('./stats');
                break;
            case 'recordsets':
                await import('./recordset');
                break;
            case 'records':
                await import('./record');
                break;
            case 'mediarecords':
                await import('./media');
                break;
            case 'collections':
                if(url(-1) !== 'collections') {
                    await import('./collection');
                } else {
                    await import('./collections');
                }
                break;
            default:
                await import('./home');
                break;
        }
    } catch (error) {
        console.error("Error loading the module: ", error);
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
