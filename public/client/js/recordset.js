/**
 * @jsx React.DOM
 */

/*
* Recordset View page.
****/
/*var React = require('react')
var fields = require('./search/lib/fields');

var keys=Object.keys(fields.byDataTerm);

var missing={};
var stotal=0,mtotal=0;
*/
var Recordset = require('./react/build/recordset');
var React = require('react');

React.render(<Recordset mtotal={mtotal} stotal={stotal} use={use} flags={flags} recordset={recordset} uuid={uuid}/>, document.getElementById('main'));
var rs = $('#recordsetID').val();
$('#table-fields, #table-use').tablesorter();
