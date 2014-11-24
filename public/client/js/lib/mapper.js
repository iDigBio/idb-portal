
var L = require('leaflet/dist/leaflet');

//elid: string name of element id;
//options: object map of settings

module.exports = function(elid, options){
    var base = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: 'Map data © OpenStreetMap contributors',
        minZoom: 0, 
        //maxZoom: 19,
        reuseTiles: true
    });

    var defaults = {
        center: [0,0],
        zoom: 2,
        layers: [base],
        scrollWheelZoom: true,
        boxZoom: false,
        zoomControl: false
    };
    if(_.isObject(options)){
        _.merge(defaults,options);
    }
    
    var map = L.map(elid,defaults);
    var idblayer;
    var interf = {
        query: function(idbquery){
            var q = JSON.stringify({rq: idbquery});
            $.ajax('//beta-search.idigbio.org/v2/mapping/',{
                data: q,
                success: function(resp){
                    console.log(resp.shortCode)
                    if(typeof idblayer == 'object'){
                        map.removeLayer(idblayer);
                    }
                    idblayer = L.tileLayer(resp.tiles,{minZoom: 1, maxZoom: 12})
                    map.addLayer(idblayer);
                },
                dataType: 'json',
                contentType: 'application/json',
                type: 'POST'
            })
        }
    }

    return interf; 
}
