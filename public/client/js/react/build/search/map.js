/**
 * @jsx React.DOM
 */

var React = require('react');
var IDBMap = require('../../../lib/mapper');

var map; 
module.exports = React.createClass({displayName: "exports",
    currentQuery: '',
    makeMapQuery: function(settings){
        var params = {};
        params["rq"] = queryBuilder.buildQueryShim(settings.search);
        if(_.has(settings,'style')){
            params["style"]=settings.style;
        }
        if(_.has(settings,'type')){
            params['type']=settings.type;
        }
        if(_.has(settings, 'threshold')){
            params['threshold']=settings.threshold;
        }
        return params;
    },
    componentDidMount: function(){
        map = new IDBMap('map');
        var query = queryBuilder.buildQueryShim(this.props.search);
        map.query(query)
    },
    shouldComponentUpdate: function(){
        return false;
    },
    componentWillReceiveProps: function(nextProps){
        var q = queryBuilder.buildQueryShim(nextProps.search);
        var next=JSON.stringify(q);
        //debugger
        if(next!==this.currentQuery){
            this.currentQuery=next;
            map.query(q);
        }
        
    },
    render: function(){
        return (
            React.createElement("div", {id: "map-wrapper"}, 
                React.createElement("div", {id: "map"})
            )
        )
    }
})