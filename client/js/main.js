/*
*MAIN iDigBio Portal client-side app file.
*this provides initial routing for per page app execution.
*****/
window.$ = require('jquery-browserify');
window.url = require('./lib/url');
window._ = require('underscore');
window.Backbone = require('backbone');
require('./lib/jquery-ui-1.10.4.custom.min');
require('../../components/jquery.tablesorter/js/jquery.tablesorter.min.js');
require('bootstrap-browserify');
Backbone.$ = $;
require('./lib/searchserver');
//
$(document).ready(function(){
	var path = url(1) == 'portal' ? url(2) : url(1);
	switch(path){
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