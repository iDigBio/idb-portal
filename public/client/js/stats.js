var React = require('react');
var ReactDOM = require('react-dom');
var StatsPage = require('./react/src/stats');

ReactDOM.render(
    <StatsPage usage={data.usage}/>,
     document.getElementById('react-wrapper')
);