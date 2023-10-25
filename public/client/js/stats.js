import React from 'react'
import ReactDOM from 'react-dom'
import StatsPage from './react/src/stats'

ReactDOM.render(
    <StatsPage usage={data.usage} ingest={data.ingest} ingestCumulative={data.ingestCumulative} collected={data.collected} taxon={data.taxon} flags={data.flags} />,
     document.getElementById('react-wrapper')
);