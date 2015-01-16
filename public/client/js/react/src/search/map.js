/**
 * @jsx React.DOM
 */

var React = require('react');
var IDBMap = require('../../../lib/mapper');

var map; 
module.exports = React.createClass({
    currentQuery: '',
    makeMapQuery: function(settings){
        var params = {};
        params["rq"] = queryBuilder.buildQueryShim(settings.search);
        if(_.has(settings,'style')){
            params["style"]=settings.style;
        }
        if(_.has(settings,'type')){
            params['type']=settings.type
        }
        return params;
    },
    componentDidMount: function(){
        map = new IDBMap('map');
        var query = this.makeMapQuery({search: this.props.search});
        map.query(query)
    },
    shouldComponentUpdate: function(){
        return false;
    },
    componentWillReceiveProps: function(nextProps){
        var q = this.makeMapQuery({search: nextProps.search });
        var next=JSON.stringify(q);
        //debugger
        if(next!==this.currentQuery){
            this.currentQuery=next;
            map.query(q);
        }
        
    },
    render: function(){
        return (
            <div id="map"></div>
        )
    }
})