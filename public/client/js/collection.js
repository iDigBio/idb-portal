var ReactDOM = require('react-dom');
var CollectionPage = require('./react/src/collection');
//var collection rendered in head of page
ReactDOM.render(<CollectionPage data={collection} />, document.getElementById('collection-wrapper'));