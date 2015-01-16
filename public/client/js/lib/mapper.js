
var L = require('leaflet/dist/leaflet');

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
    
    this.map = L.map(elid,this.defaults);
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
