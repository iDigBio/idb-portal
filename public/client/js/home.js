
//var React = require('react');
//var HomePage = React.createFactory(require('./react/build/home'));
var idbapi = require('./lib/idbapi');
var record = {"rq":{"kingdom":{"type":"exists"}},"top_fields": ["kingdom"]};
var colors = ['#cf7a0b','#3782cd','#d3b833','#6aaa51','#ED475A','#A7EC7C','#56E4F4'];
function formatNum(num){
    return num.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

idbapi.summary('top/basic/',record,function(response){
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

idbapi.summary('top/basic/',media,function(response){
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

idbapi.summary('count/basic/',function(resp){
    $('#recordcount').html(formatNum(resp.itemCount));
});
idbapi.summary('count/media/',function(resp){
    $('#mediacount').html(formatNum(resp.itemCount));
})
idbapi.summary('count/recordset/',function(resp){
    $('#recordsetcount').html(formatNum(resp.itemCount));
});