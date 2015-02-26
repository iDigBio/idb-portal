/**
 * @jsx React.DOM
 */

var React = require('react');
var MediaPage = require('./react/build/media');

React.renderComponent(
    <MediaPage mediarecord={data.mediarecord} record={data.record} />,
     document.getElementById('react-wrapper')
);