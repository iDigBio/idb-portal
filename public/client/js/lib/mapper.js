
var L = require('leaflet/dist/leaflet');
var $ = require('jquery');
var _ = require('lodash');
require('../../../../public/components/leaflet-utfgrid/dist/leaflet.utfgrid');
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
        boxZoom: true,
        zoomControl: true,
        worldCopyJump: true
    };
    if(typeof options == 'object'){
        _.merge(this.defaults,options);
    }
    //init map
    this.map = L.map(elid,this.defaults);
    this.map.addControl(new MaximizeButton());
    //add modal pane for expanded view
    $('body').append('<div id="mapper-modal"></div>');
    //
    var popup = L.popup(), mapCode, self=this;
    var mapapi = "//beta-search.idigbio.org/v2/mapping/";
    this.map.on('click', function(e) {
        $.getJSON(mapapi + mapCode + "/points?lat=" + e.latlng.lat + "&lon=" + e.latlng.lng + "&zoom=" + self.map.getZoom(), function(data){
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString() + ".<br>There are " + data.itemCount + " records in this map cell.")
                .openOn(self.map);
        });
    });  
    this.currentQueryTime = 0;
    var idblayer,utf8grid;
    
    this.query = function(idbquery){
        var query = {rq: idbquery, type: 'auto', threshold: 100000, style: {fill: '#f33',stroke: 'rgb(229,245,249,.8)'}};
        var q = JSON.stringify(query),self=this, d = new Date;
 
        var time = d.getTime();
        self.currentQueryTime=time;
        $.ajax(mapapi,{
            data: q,
            success: function(resp){
                //console.log(resp.shortCode)
                //make sure last query run is the last one that renders
                //as responses can be out of order
                mapCode = resp.shortCode;
                if(time>=self.currentQueryTime){
                    if(typeof idblayer == 'object'){
                        self.map.removeLayer(idblayer);
                    }
                    if(typeof utf8grid == 'object'){
                        self.map.removeLayer(utf8grid);
                    }
                    idblayer = L.tileLayer(resp.tiles,{minZoom: 1})
                    utf8grid = L.utfGrid(resp.utf8grid,{
                        useJsonP: false
                    });
                    self.map.addLayer(idblayer); 
                    self.map.addLayer(utf8grid);                  
                }
            },
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            crossDomain: true
        })
    }
}

/*
* Map Controls
****/
var resizeFunction = _.noop;

var MaximizeButton =  L.Control.extend({
    options: {
        position:"topright"
    },
    _div: L.DomUtil.create('a', 'map-button'),
    expandFunc: function(map,control){
        return function (e) {
            L.DomEvent.stopPropagation(e);
            var width = $(window).width(), height = $(window).height();
            var cont = map.getContainer(), contwidth = $(cont).width(), contheight = $(cont).height();
            var pos = $(cont).position();
            $(cont).css('position', 'fixed')
            .css('top',pos.top+'px')
            .css('left',pos.left+'px')
            .css('width',contwidth+'px')
            .css('height',contheight+'px')
            .css('z-index','550');
            $(cont).animate({width: (width-53), height: (height-53), margin: 25, left:0,top:0},{
                duration: 200,
                complete: function(){
                    $('#mapper-modal').show();
                    map.invalidateSize();
                },
                progress: function(){
                    map.invalidateSize();
                }
            });
            map.removeControl(control);
            resizeFunction = function(){
                var width = $(window).width(), height = $(window).height();
                $(cont).css('width', (width-53)+'px').css('height', (height-53)+'px');
                $(cont).css('width', (width-53)+'px').css('height', (height-53)+'px');
                map.invalidateSize()
            };
            L.DomEvent.addListener(window, 'resize', resizeFunction);
        }
    },
    onAdd: function(map){
        this.map = map;
        this._div.innerHTML = '<div title="maximize map" id="map-maximize-button" class="map-button-icon"></div>';
        this.expandClick = this.expandFunc(map,this);
        L.DomEvent.addListener(this._div, 'click', this.expandClick);
        return this._div;
    },
    onRemove: function(map){
        L.DomEvent.removeListener(this._div, 'click', this.expandClick);
        map.addControl(new MinimizeButton());
    }
});

var MinimizeButton = L.Control.extend({
    options: {
        position:"topright"
    },
    _div: L.DomUtil.create('a', 'map-button'),
    contractFunc: function(map,control){
        return function (e) {
            L.DomEvent.stopPropagation(e);
            $('#mapper-modal').hide();
            var cont = map.getContainer();
            $(cont).removeAttr('style');
            map.invalidateSize();
            //map.zoomOut();
            map.removeControl(control);
        }
    },
    onAdd: function(map){
        this.map = map;
        this._div.innerHTML = '<div title="minimize map" id="map-minimize-button" class="map-button-icon"></div>';
        this.contractClick = this.contractFunc(map,this);
        L.DomEvent.addListener(this._div, 'click', this.contractClick);
        return this._div;
    },
    onRemove: function(map){
        L.DomEvent.removeListener(this._div, 'click', this.contractClick);
        L.DomEvent.removeListener(window, 'resize', resizeFunction);
        map.addControl(new MaximizeButton());
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

var legend = L.Control.extend({
    options: {
        position: "bottomleft"
    },
    _div: L.DomUtil.create('div','map-legend'),
    onAdd: function(map){

    },
    onRemove: function(map){

    }
})
