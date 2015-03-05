var React = require('react');
var CollectionPage = require('./react/build/collection');
//var collection rendered in head of page
React.render(<CollectionPage data={collection} />, document.getElementById('collection'));