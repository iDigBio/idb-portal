/**
 * @jsx React.DOM
 */

var React = require('react')
var SearchPage = React.createFactory(require('./react/build/search'));

React.initializeTouchEvents(true);
React.render(
    <SearchPage />,
    document.getElementById('main')
)

