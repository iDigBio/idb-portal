/**
 * @jsx React.DOM
 */

var React = require('react')
var SearchPage = require('./react/build/search');

React.renderComponent(
    <SearchPage />,
    document.getElementById('main')
)

