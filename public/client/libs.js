//required Global libs bundle

window.$ = window.jQuery = require('jquery');
require('jquery-ui-browserify');
window.url = require('wurl');
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
require('es5-shim');
window.c3 = require('c3');
