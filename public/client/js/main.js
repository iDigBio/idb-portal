/*
*MAIN iDigBio Portal client-side app file.
*this provides initial routing for per page app execution.
*****/
"use strict"

//DEV SETTING
    localStorage.clear();
//
$(document).ready(function(){
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
});	