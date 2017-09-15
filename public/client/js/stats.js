var React = require('react');
var ReactDOM = require('react-dom');
var StatsPage = require('./react/src/stats');

ReactDOM.render(
    <StatsPage usage={data.usage} ingest={data.ingest} collected={data.collected} taxon={data.taxon} flags={data.flags} />,
     document.getElementById('react-wrapper')
);