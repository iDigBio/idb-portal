

var React = require('react');
var MediaPage = require('./react/build/media');

React.render(
    <MediaPage mediarecord={data.mediarecord} record={data.record} />,
     document.getElementById('react-wrapper')
);