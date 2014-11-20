/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({displayName: 'exports',
    render: function(){
        return(
            React.DOM.div({className: "option-group", id: "mapping-options"}, 
                React.DOM.div({className: "ordinates clearfix"}, 
                    React.DOM.label({className: "title"}, "NorthWest"), 
                    React.DOM.div({className: "pull-left ordinate"}, 
                        "Lat:", 
                        React.DOM.input({type: "text", className: "coordinate form-control"})
                    ), 
                    React.DOM.div({className: "ordinate"}, 
                        "Lon:", 
                        React.DOM.input({type: "text", className: "coordinate form-control"})
                    )
                ), 
                React.DOM.div({className: "ordinates clearfix"}, 
                    React.DOM.label({className: "title"}, "SouthEast"), 
                    React.DOM.div({className: "pull-left ordinate"}, 
                        "Lat:", 
                        React.DOM.input({type: "text", className: "coordinate form-control"})
                    ), 
                    React.DOM.div({className: "ordinate"}, 
                        "Lon:", 
                        React.DOM.input({type: "text", className: "coordinate form-control"})
                    )
                )
            )
        )
    }
})