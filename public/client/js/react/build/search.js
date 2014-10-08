/**
 * @jsx React.DOM
 */

var React = require('react')
var dwc = require('./lib/dwc_fields');
var _ = require('underscore');


module.exports = React.createClass({displayName: 'exports',
    render: function(){

        return(
            React.DOM.div({key: "react"}, 
                React.DOM.div({key: 'left', className: "row"}, 
                    React.DOM.div({key: "fulltext", id: "search", className: "clearfix"}, 
                        
                        React.DOM.div({id: "search-any", className: "clearfix"}, 
                            React.DOM.h3(null, "Start Searching"), 
                            React.DOM.div({className: "input-group"}, 
                                React.DOM.input({type: "text", className: "form-control", placeholder: "search any field"}), 
                                React.DOM.a({className: "btn input-group-addon"}, "Go")
                            ), 
                            React.DOM.div({className: "checkbox"}, 
                                React.DOM.label(null, 
                                    React.DOM.input({type: "checkbox"}), 
                                    "Must have image"
                                )
                            ), 
                            React.DOM.div({className: "checkbox"}, 
                                React.DOM.label(null, 
                                    React.DOM.input({type: "checkbox"}), 
                                    "Must have map point"
                                )
                            )
                        ), 
                        React.DOM.div({key: "filters", id: "options"}, 
                            React.DOM.ul({id: "options-menu"}, 
                                React.DOM.li(null, "Sorting "), 
                                React.DOM.li(null, "Advanced Filters "), 
                                React.DOM.li(null, "Download & History")
                            ), 
                            React.DOM.div({className: "clearfix panel active", id: "filter-sort"}, 
                                React.DOM.label(null, "Sort by"), 
                                React.DOM.select(null, React.DOM.option({value: "select"}, "select")), 
                                React.DOM.label(null, "Sort direction"), 
                                React.DOM.select(null, React.DOM.option({value: "select"}, "select"))
                            ), 
                            React.DOM.div({className: "clearfix panel", id: "filter-control"}, 
                                React.DOM.h4(null, "Advanced Filters"), 
                                React.DOM.select({placeholder: "select to add"}, React.DOM.option({value: "select"}, "select to add"))
                            ), 
                            React.DOM.div({className: "panel"}, 
                                "Scientific Name", 
                                React.DOM.textarea(null)
                            )
                        )
                    ), 
                    React.DOM.div({id: "map-box"}, 
                        React.DOM.div({id: "map"})
                    )
                )
            )
        )
    }
})