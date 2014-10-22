/**
 * @jsx React.DOM
 */

var React = require('react');
var fields = require('../../../lib/fields');

module.exports = React.createClass({
    getInitialState: function(){
        return {results:[]};
    },
    render: function(){
        var self=this;
        if(_.isEmpty(this.props.text)){
           
            return <div/>
        }else{
            var split = this.props.text.split('\n'),
            last = split[split.length-1],
            field = fields.byName[this.props.name].term,
            query = {"aggs":{},"from":0,"size":0};

            query.aggs["static_"+field]={"terms":{"field":field,"include":"^"+last+".*","exclude":"^.{1,2}$","size":15}};

            searchServer.esQuery('records', query, function(resp) {
                var sorted = resp.aggregations['static_' + field]['buckets'].map(function(val){
                    return val.key
                }).sort();
                self.setState({results: sorted});
            });
            return(
                <Results results={this.state.results} />
            )
        }
    }
})

var Results = React.createClass({
    render: function(){
        var list=[];
        _.each(this.props.results,function(item){
            list.push(<Result key={item} />)
        })
        var display = _.isEmpty(list) ? 'none' : 'block';
        return(
            <ul className="auto-list" style={{display: display}}>
                {list}
            </ul>
        )
    }
})

var Result = React.createClass({
    render: function(){
        return(
            <li className="auto-item" key={this.props.key}>{this.props.key}</li>
        )
    }
})