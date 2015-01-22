
var L = require('leaflet/dist/leaflet');
var $ = require('jquery');
var _ = require('lodash');
//elid: string name of element id;
//options: object map of settings
/*
*Map object
*initialize with new IDBMap(elid=String of element to bind to,options={} to overide defaults)
***/
module.exports = IDBMap =  function(elid, options){
    var base = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: 'Map data © OpenStreetMap contributors',
        minZoom: 0, 
        //maxZoom: 19,
        reuseTiles: true
    });

    this.defaults = {
        center: [0,0],
        zoom: 2,
        layers: [base],
        scrollWheelZoom: true,
        boxZoom: false,
        zoomControl: true
    };
    if(typeof options == 'object'){
        _.merge(this.defaults,options);
    }
    //init map
    this.map = L.map(elid,this.defaults);
    this.map.addControl(new ExpandButton());
    //add modal pane for expanded view
    $('body').append('<div id="mapper-modal"></div>');
    //
    this.currentQueryTime = 0;
    var idblayer;
    
    this.query = function(idbquery){
        var q = JSON.stringify(idbquery),self=this, d = new Date;
        var time = d.getTime();
        self.currentQueryTime=time;
        $.ajax('//beta-search.idigbio.org/v2/mapping/',{
            data: q,
            success: function(resp){
                //console.log(resp.shortCode)
                //make sure last query run is the last one that renders
                //as responses can be out of order
                if(time>=self.currentQueryTime){
                    if(typeof idblayer == 'object'){
                        self.map.removeLayer(idblayer);
                    }
                    idblayer = L.tileLayer(resp.tiles,{minZoom: 1, maxZoom: 12})
                    self.map.addLayer(idblayer);                    
                }
            },
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST'
        })
    }
}

    /*
    * Map Controls
    ****/
var ExpandButton =  L.Control.extend({
    options: {
        position:"topright"
    },
    _div: L.DomUtil.create('div', 'map-button'),
    onAdd: function(map){
        var selfish = this;
        this._div.innerHTML = '<div title="maximize map" id="map-expand-button" class="map-button-icon"></div>';
        var cont = map.getContainer();
        L.DomEvent.addListener(this._div, 'click', function (e) {
            L.DomEvent.stopPropagation(e);
            var width = $(window).width(), height = $(window).height();
            var pos = $(cont).position();
            $(cont).css('position', 'fixed').css('top',pos.top+'px').css('left',pos.left+'px').css('z-index','550');
            $(cont).animate({width: (width-53), height: (height-53), margin: 25, left:0,top:0},{
                duration: 300,
                complete: function(){
                    $('#mapper-modal').show();
                    map.invalidateSize();
                },
                progress: function(){
                    map.invalidateSize();
                }
            });
            map.removeControl(selfish);
        });
        return this._div;
    },
    onRemove: function(map){
        
    }
});

var drawZoomButton = L.Control.extend({
    options: {
        position:"topright"
    },
    _div: L.DomUtil.create('div', 'drawzoom-div map-button'),
    onAdd: function(map){     
        this._div.innerHTML = '<div class="drawzoom-button map-button-icon" title="activate draw zoom"></div>';   
        return this._div;
    },
    onRemove: function(map){
        return this._div;
    }
});
