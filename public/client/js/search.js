/**
 * @jsx React.DOM
 */

var React = require('react')
var SearchPage = require('./react/build/search');

React.initializeTouchEvents(true);
React.renderComponent(
    <SearchPage />,
    document.getElementById('main')
)

