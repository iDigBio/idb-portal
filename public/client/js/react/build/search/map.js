/**
 * @jsx React.DOM
 */

var React = require('react');
var IDBMap = require('../../../lib/mapper');

var map; 
module.exports = React.createClass({displayName: 'exports',
    currentQuery: '',
    componentDidMount: function(){
        map = new IDBMap('map');
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
            this.currentQuery=next;
            map.query(q);
        }
        
    },
    render: function(){
        return (
            React.DOM.div({id: "map"})
        )
    }
})