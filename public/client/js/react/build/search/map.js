
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
        var self = this;
        map = new IDBMap('map',{},function(e,resp,map){
            var str;
            if(resp.itemCount > 100){
                var a = document.createElement('A');
                var nwlat = document.createAttribute('data-nw-lat');
                nwlat.value=resp.bbox.nw.lat;
                a.setAttributeNode(nwlat);
                var nwlon = document.createAttribute('data-nw-lon');
                nwlon.value=resp.bbox.nw.lon;
                a.setAttributeNode(nwlon);
                var selat = document.createAttribute('data-se-lat');
                selat.value=resp.bbox.se.lat;
                a.setAttributeNode(selat);
                var selon = document.createAttribute('data-se-lon');
                selon.value=resp.bbox.se.lon;
                a.setAttributeNode(selon);
                var href = document.createAttribute('href');
                href.value = '#';
                a.setAttributeNode(href);
                a.innerHTML = 'There are '+resp.itemCount+' items in this locality.';
                a.addEventListener('click',function(e){
                    var bounds={}, target=e.currentTarget.attributes;
                    bounds['top_left']={lat: parseFloat(target['data-nw-lat'].value),lon: parseFloat(target['data-nw-lon'].value)};
                    bounds['bottom_right']={lat: parseFloat(target['data-se-lat'].value),lon: parseFloat(target['data-se-lon'].value)};
                    self.props.searchChange('mapping',{type: 'box', bounds: bounds});
                    map.closePopup();
                })
                str = a;
                //str = 'There are '+resp.itemCount+' items in this locality.' +
                //' Click <a class="bbox-link" data-nw-lat="'+resp.bbox.nw.lat+'" data-nw-lon="'+
                //resp.bbox.nw.lon+'" data-se-lat="'+resp.bbox.se.lat+'" data-se-lon="'+resp.bbox.se.lon+'" href="#">here</a> to set the mapping bounding box on this region';
            }else{
                var links = _.map(resp.items,function(item){
                    var title = helpers.filterFirst([item.indexTerms.scientificname,item.indexTerms.genus,item.indexTerms.specificepithet]);
                    
                    var html='<div class="map-popup-item"><a target="'+item.uuid+'" href="/portal/records/'+item.uuid+'">'+
                     title+
                    '</a></div>';
                    return html;
                });
                str='<div class="map-popup-wrapper">'+links.join('')+'</div>';
            }
            return str;
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