/*
*MAIN iDigBio Portal client-side app file.
*this provides initial routing for per page app execution.
*****/
"use strict"

if ($('html').is('.ie-old')) {
    alert('iDigBio Portal will not work on this Browser. Please update Internet Explorer to version 10 or newer');
}

function loadPage(){
	var path = url(1) == 'portal' ? url(2) : url(1);
	switch(path){
		case '':
			require('./home');
			break;
		case 'search':
			require('./search');
			break;
		case 'tutorial':
			require('./tutorial');
			break;
		case 'publishers':
			require('./publishers');
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
			if(url(-1)!=='collections'){
				require('./collection')
			}else{
				require('./collections');
			}
			break;
	}
}

$(function(){
	//if errors occur on page load try once to clear localStore and refresh
	try{
		loadPage();
		localStorage.removeItem('reloaded');
	}catch(e){
		if(localStorage){
			console.warn(e);
			if(localStorage.getItem('reloaded') === null){
				localStorage.clear();
				localStorage.setItem('reloaded','true');
				location.reload();
			}else{
				localStorage.removeItem('reloaded');
			}
		}
	}
});	