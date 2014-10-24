/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({displayName: 'exports',
    getInitialState: function(){
        return {view: 'list'};
    },
    viewChange: function(event){
        this.setState({view: event.currentTarget.attributes['data-value'].value})
    },
    render: function(){
        var search = this.props.search;
        return(
            React.DOM.div({id: "results", className: "clearfix"}, 
                React.DOM.ul({id: "results-menu"}, 
                    React.DOM.li({onClick: this.viewChange, 'data-value': "list"}, "List"), 
                    React.DOM.li({onClick: this.viewChange, 'data-value': "labels"}, "Labels"), 
                    React.DOM.li({onClick: this.viewChange, 'data-value': "images"}, "Images")
                ), 
                ResultsPanel({search: search, view: this.state.view})
            )
        )
    }
});

var ResultsPanel = React.createClass({displayName: 'ResultsPanel',
    getInitialState: function(){
        return {results: []};
    },
    render: function(){
        var query = buildQuery(this.props.search),self=this;


        return(
            React.DOM.div({className: "panel"}
            )
        )
    }
})