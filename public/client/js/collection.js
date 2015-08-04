var React = require('react');
var CollectionPage = require('./react/src/collection');
//var collection rendered in head of page
React.render(<CollectionPage data={collection} />, document.getElementById('collection-wrapper'));