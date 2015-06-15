
var React = require('react');
var IDBMap = require('../../../lib/mapper');
var helpers = require('../../../lib/helpers');

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
        var self=this;
        map = new IDBMap('map',{
            queryChange: function(e,extra){
                var mapping;
                if(typeof extra === 'string' && extra == 'drawing'){
                    
                    switch(e.layerType){
                        case 'rectangle':
                            mapping={
                                type: 'box',
                                bounds: {
                                    top_left: { 
                                        lat: e.layer._latlngs[1].lat,
                                        lon: e.layer._latlngs[1].lng
                                    },
                                    bottom_right: {
                                        lat: e.layer._latlngs[3].lat,
                                        lon: e.layer._latlngs[3].lng
                                    }
                                }
                            }
                            break;
                        case 'circle':
                            mapping={
                                type: 'radius',
                                bounds: {
                                    distance: Math.round(e.layer._mRadius/1000),
                                    lat: e.layer._latlng.lat,
                                    lon: e.layer._latlng.lng
                                }
                            }
                            break;
                    }
                   
                }else if(typeof extra === 'object'){
                    var data = extra;
                    if(_.has(data,'bbox')){
                        mapping = {
                            type: 'box',
                            bounds: {
                                top_left: data.bbox.nw,
                                bottom_right: data.bbox.se
                            }
                        }           
                    }
                    if(_.has(data,'radius')){  
                        mapping = {
                            type: 'radius',
                            bounds: data.radius
                        }
                    }                    
                }
                self.props.viewChange('optionsTab','mapping');
                self.props.searchChange('mapping',mapping)
            }
        });

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