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
                    React.DOM.div({key: "fulltext", id: "search-fulltext", className: "col-lg-4 clearfix"}, 
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
                        ), 
                        React.DOM.div({key: "filters", id: "search-filters"}, 
                            React.DOM.div({className: "clearfix", id: "filter-control"}, 
                                React.DOM.h4(null, "Add a Filter"), 
                                React.DOM.select(null, React.DOM.option({value: "select"}, "select"))
                            ), 
                            React.DOM.div({className: "filter"}, 
                                "Scientific Name", 
                                React.DOM.textarea(null)
                            )
                        )
                    ), 
                    React.DOM.div({id: "map-holder", className: "col-lg-8"}, 
                        React.DOM.div({id: "map"})
                    )
                )
            )
        )
    }
})