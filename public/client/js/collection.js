import React from 'react'
import ReactDOM from 'react-dom'
import CollectionPage from './react/src/collection'
//var collection rendered in head of page
ReactDOM.render(<CollectionPage data={collection} />, document.getElementById('collection-wrapper'));