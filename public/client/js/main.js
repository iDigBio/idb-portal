/*
*MAIN iDigBio Portal client-side app file.
*this provides initial routing for per page app execution.
*****/
window.$ = require('jquery');
require('jquery-ui-browserify');
window.url = require('./lib/url');
//window._ = require('underscore');
//window.Backbone = require('backbone');
//require('../../components/jquery.tablesorter/js/jquery.tablesorter.min.js');
//Backbone.$ = $;
require('./lib/searchserver');
window.queryBuilder = require('./lib/querybuilder');
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
	}
});	