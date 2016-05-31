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
var Recordset = require('./react/src/recordset');
var React = require('react');
var ReactDOM = require('react-dom');

ReactDOM.render(<Recordset mtotal={mtotal} stotal={stotal} use={use} flags={flags} recordset={recordset} lastmodified={lastmodified} uuid={uuid}/>, document.getElementById('main'));
var rs = $('#recordsetID').val();
$('#table-fields, #table-use').tablesorter();

$('#side-nav-list').affix({
    offset: {
        top: function(){
            return $('#content').offset().top - $(window).scrollTop();
        }
    }
})

$('.scrollspy').scrollSpy({
    offsetTop: -205
});

$('[data-toggle="tooltip"]').tooltip();