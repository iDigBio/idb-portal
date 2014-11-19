/**
 * @jsx React.DOM
 */

var React = require('react');
var mapper = require('../../../lib/mapper');

var map; 
module.exports = React.createClass({
    componentDidMount: function(){
        map = mapper('map');
        var query = queryBuilder.makeIDBQuery(this.props.search);
        map.query(query)
    },
    shouldComponentUpdate: function(){
        return false;
    },
    componentWillReceiveProps: function(nextProps){
        var next= queryBuilder.makeIDBQuery(nextProps.search),
        current=queryBuilder.makeIDBQuery(this.props.search);
        //debugger
        if(JSON.stringify(next)!==JSON.stringify(current)){
            map.query(next);
        }
    },
    render: function(){
        return (
            <div id="map"></div>
        )
    }
})