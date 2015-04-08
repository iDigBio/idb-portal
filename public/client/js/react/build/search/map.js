
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
        var func = _.noop;
        var clickFunc = function(e){
            func();
        }
        map = new IDBMap('map',{},function(data){
            
            if(_.has(data,'bbox')){
                func = function(){
                    self.props.searchChange('mapping',{
                        type: 'box',
                        bounds: {
                            top_left: data.bbox.nw,
                            bottom_right: data.bbox.se
                        }
                    })
                }
            }
            if(_.has(data,'radius')){
                func = function(){
                    self.props.searchChange('mapping',{
                        type: 'radius',
                        bounds: data.radius
                    })
                }
            }

            return '<a href="#" class="set-bounds-link">Set Map Bounds</a>';
        }, function(){
            $('.set-bounds-link').off('click',clickFunc);
            $('.set-bounds-link').on('click',clickFunc);
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