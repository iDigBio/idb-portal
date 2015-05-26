//required Global libs bundle
window.$ = jQuery = require('jquery');
require('jquery-ui-browserify');
window.url = require('./js/lib/url');
window._ = require('lodash');
window.helpers = require('./js/lib/helpers');
window.fields = require('./js/lib/fields');
window.dwc = require('./js/lib/dwc_fields');
require('./js/lib/searchserver');
window.queryBuilder = require('./js/lib/querybuilder');
window.async = require('async');
var SearchHistory = require('./js/lib/history');
window.searchHistory = new SearchHistory;
//window.React = require('react');
require('../components/bootstrap/dist/js/bootstrap.min');
require('../components/jquery.tablesorter/js/jquery.tablesorter.min');
//$.fn.datetimepicker = require('eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker');
require('es5-shim/es5-shim.min');
require('es5-shim/es5-sham.min');
