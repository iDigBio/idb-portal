/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');

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
        var query = queryBuilder.makeQuery(this.props.search), self=this;
        searchServer.esQuery('records',query,function(results){
            self.setState({results: results.hits.hits, time: Date.now()},function(){
                self.forceUpdate();
            });
        });
        return {results: [], time: Date.now()};
    },
    shouldComponentUpdate: function(nextProps, nextState){
        //return JSON.stringify(nextProps.search) != JSON.stringify(this.props.search);
        return false;
    },
    componentWillReceiveProps: function(){
        var query = queryBuilder.makeQuery(this.props.search), self=this;
        searchServer.esQuery('records',query,function(results){
            self.setState({results: results.hits.hits, time: Date.now()},function(){
                self.forceUpdate();
            });
        });
    },
    render: function(){
        var columns = ['scientificname','genus','collectioncode','specificepithet','commonname'];
        var rows=[];

        this.state.results.forEach(function(item){
            var tds = [];
            columns.forEach(function(name){
                var val = helpers.check(item._source.data['idigbio:data'][fields.byTerm[name].dataterm]);
                tds.push(React.DOM.td(null, val));
            })
            rows.push(
                React.DOM.tr(null, 
                    tds
                )
            );
        })
       
        return(
            React.DOM.div({className: "panel"}, 
                React.DOM.table({className: "table table-condensed"}, 
                    React.DOM.tbody(null, 
                        rows
                    )
                )
            )
        )
    }
})