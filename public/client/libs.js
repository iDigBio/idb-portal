//required Global libs bundle

if (typeof window !== "object") {
	global.window = {};
	var window = global.window;
}

window.$ = jQuery = require('jquery');
require('jquery-ui-browserify');
window.url = require('./js/lib/url');
window._ = require('lodash');
window.helpers = require('./js/lib/helpers');
window.fields = require('./js/lib/fields');
window.dwc = require('./js/lib/dwc_fields');
window.queryBuilder = require('./js/lib/querybuilder');
window.async = require('async');
var SearchHistory = require('./js/lib/history');
window.searchHistory = new SearchHistory;
require('bootstrap');
window.tablesorter = require('tablesorter/dist/js/jquery.tablesorter.js');
window.Hammer = require('hammerjs/hammer.js');
require('materialize-css/dist/js/materialize.js');
require('es5-shim');
window.c3 = require('c3');
