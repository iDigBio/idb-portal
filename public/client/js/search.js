

var React = require('react')
var SearchPage = require('./react/src/search');

React.initializeTouchEvents(true);
React.render(
    <SearchPage />,
    document.getElementById('main')
)

