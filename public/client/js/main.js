/*
*MAIN iDigBio Portal client-side app file.
*this provides initial routing for per page app execution.
*****/
"use strict"

function loadPage(path){
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

$(document).ready(function(){
	//try once to clear localStore and refresh if errors occur;
	try{
		var path = url(1) == 'portal' ? url(2) : url(1);
		loadPage(path);
		localStorage.removeItem('reloaded');
	}catch(e){
		if(typeof localStorage !== undefined && localStorage.getItem('reloaded') === null){
			localStorage.clear();
			localStorage.setItem('reloaded','true');
			location.reload();
		}
	}
});	