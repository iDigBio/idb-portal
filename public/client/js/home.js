
//var React = require('react');
//var HomePage = React.createFactory(require('./react/build/home'));
var idbapi = require('./lib/idbapi');

var colors = ['#cf7a0b','#3782cd','#d3b833','#6aaa51','#ED475A','#A7EC7C','#56E4F4'];

var record = {"rq":{"kingdom":{"type":"exists"}},"top_fields": ["kingdom"]};
idbapi.summary('top/records/',record,function(response){
    var kingdoms = {
        "incertae": "other",
        "ichnofossil": "other",
        "taxon indet.": "other"
    }
    var king=[],other=['other'];
    _.each(response.kingdom, function(v,k){
        if(_.isUndefined(kingdoms[k])){
            king.push([k,v.itemCount]);
        }else{
            other.push(v.itemCount)
        }
    })
    king.push(other);
    var chart = c3.generate({
        data:{
            columns: king,
            type: 'pie'
        },
        bindto:'#specimen-chart',
        pie:{
            label:{
                format: function(value, ratio, id){
                    return Math.round(ratio*100*10)/10+'%'
                }
            }
        },
        color:{
            pattern: colors
        },
        size:{
            height:280
        }
    })
})

var media = {"rq":{"kingdom":{"type":"exists"},"hasImage":true},"top_fields": ["kingdom"]};

idbapi.summary('top/records/',media,function(response){
    var kingdoms = {
        "incertae": "other",
        "ichnofossil": "other",
        "taxon indet.": "other",
        "monocotyledonae": "other",
        "pteridophyta": "other"
    }
    var king=[],other=['other'];
    _.each(response.kingdom, function(v,k){
        if(_.isUndefined(kingdoms[k])){
            king.push([k,v.itemCount]);
        }else{
            other.push(v.itemCount)
        }
    })
    king.push(other);
    var chart = c3.generate({
        data:{
            columns: king,
            type: 'pie'
        },
        bindto:'#media-chart',
        color:{
            pattern: colors
        },
        size:{
            height:280
        }
    })
})

function formatNum(num){
    return num.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
idbapi.summary('count/records/',function(resp){
    $('#recordcount').html(formatNum(resp.itemCount));
});
idbapi.summary('count/media/',function(resp){
    $('#mediacount').html(formatNum(resp.itemCount));
})
idbapi.summary('count/recordset/',function(resp){
    $('#recordsets-total').html(formatNum(resp.itemCount));
});
$('#searchbox').autocomplete({
    source: function(searchString, respCallback) {
        var rq ={"scientificname": {'type':'prefix', 'value': searchString.term}};
        query = {rq: rq, count: 15, top_fields:["scientificname"]};

        idbapi.summary('top/records/',query, function(resp) {
            var list = _.map(resp["scientificname"], function(v,k){
                return k;
            })
            respCallback(list);
        })
    },
    select: function(event,ui){
        window.location = '/portal/search?rq={"scientificname":"'+ui.item.value+'"}';             
    }
});