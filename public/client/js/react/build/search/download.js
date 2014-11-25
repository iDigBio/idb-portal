/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({displayName: 'exports',
    
    render: function(){
        var options = [];

        searchHistory.history.forEach(function(item,ind){
            options.push(
                React.DOM.option({value: ind}, JSON.stringify(item))
            )
        })
        return (
            React.DOM.div(null, 
                React.DOM.div(null, 
                    React.DOM.select({className: "form-field"}, 
                        options
                    )
                )
            )
        )
    }
});