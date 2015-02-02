/**
 * @jsx React.DOM
 */
var React = require('react');
var HomePage = require('./react/build/home');

var query = {"fields": ["kingdom"]};
$.ajax('//beta-search.idigbio.org/v2/summary/top/basic/',{
    data: JSON.stringify(query),
    success: function(response){
        React.render(
            <HomePage data={response} />,
             document.getElementById('react-wrapper')
        )
    },
    dataType: 'json',
    contentType: 'application/json',
    type: 'POST'
});

