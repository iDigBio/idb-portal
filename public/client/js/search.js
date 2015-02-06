

var React = require('react')
var SearchPage = require('./react/build/search');

React.initializeTouchEvents(true);
React.render(
    <SearchPage />,
    document.getElementById('main')
)

