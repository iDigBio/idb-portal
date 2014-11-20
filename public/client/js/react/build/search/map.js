/**
 * @jsx React.DOM
 */

var React = require('react');
var mapper = require('../../../lib/mapper');

var map; 
module.exports = React.createClass({displayName: 'exports',
    currentQuery: '',
    componentDidMount: function(){
        map = mapper('map');
        var query = queryBuilder.makeIDBQuery(this.props.search);
        map.query(query)
    },
    shouldComponentUpdate: function(){
        return false;
    },
    componentWillReceiveProps: function(nextProps){
        var q = queryBuilder.makeIDBQuery(nextProps.search);
        var next=JSON.stringify(q);
        //debugger
        if(next!==this.currentQuery){
            map.query(q);
        }
        this.currentQuery=next;
    },
    render: function(){
        return (
            React.DOM.div({id: "map"})
        )
    }
})