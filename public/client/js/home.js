
//var React = require('react');
//var HomePage = React.createFactory(require('./react/build/home'));
var idbapi = require('./lib/idbapi');

var colors = ['#6C477C','#56E4F4','#194B94','#ED2E2E','#C86B61'];
var kingdomColor={'plantae': '#6aaa51','fungi':'#d3b833' ,'chromista': '#cf7a0b','animalia': '#3782cd', 'protozoa': '#DD5656' },colorsIndex=0;
var setGetColor = function(kingdom){
    if(_.isUndefined(colors[colorsIndex])){
        colorsIndex=0;
    }
    if(_.isUndefined(kingdomColor[kingdom])){
        kingdomColor[kingdom]=colors[colorsIndex];
        colorsIndex++;
    }
    return kingdomColor[kingdom];
};
var record = {"rq":{"kingdom":{"type":"exists"}},"top_fields": ["kingdom"]};
idbapi.summary('top/records/',record,function(response){
    var kingdoms = {
        "incertae": "other",
        "ichnofossil": "other",
        "taxon indet.": "other"
    }
    var king=[],other=['other'],colorOrder=[];
    _.each(response.kingdom, function(v,k){
        if(_.isUndefined(kingdoms[k])){
            king.push([k,v.itemCount]);
            
        }else{
            other.push(v.itemCount)
        }
    })
    king.push(other);
    king.sort(function(a,b){
        if (a[1] > b[1]) {
            return -1;
        }
        if (a[1] < b[1]) {
            return 1;
        }

        // a must be equal to b
        return 0;
    });
    king.forEach(function(item){
        colorOrder.push(setGetColor(item[0]));
    });

    var chart = c3.generate({
        data:{
            columns: king,
            type: 'pie',
            onclick: function(d,el){
                if(d.name.toLowerCase()!='other'){
                    window.location = '/portal/search?rq={"kingdom":"'+d.name+'"}';
                }
            }
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
            pattern: colorOrder
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
    var king=[],other=['other'],colorOrder=[];
    _.each(response.kingdom, function(v,k){
        if(_.isUndefined(kingdoms[k])){
            king.push([k,v.itemCount]);
        }else{
            other.push(v.itemCount)
        }
    });
    king.push(other);
    king.sort(function(a,b){
        if (a[1] > b[1]) {
            return -1;
        }
        if (a[1] < b[1]) {
            return 1;
        }
        // a must be equal to b
        return 0;
    });
    
    king.forEach(function(item){
        colorOrder.push(setGetColor(item[0]));
    });
    
    var chart = c3.generate({
        data:{
            columns: king,
            type: 'pie',
            onclick: function(d,el){
                if(d.name.toLowerCase()!='other'){
                    window.location = '/portal/search?rq={"kingdom":"'+d.name+'"}&view=images';
                }
            }
        },
        bindto:'#media-chart',
        color:{
            pattern: colorOrder
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

$('#searchbox').keypress(function(e) {
    if(e.which == 13) {
        e.preventDefault();
        window.location = '/portal/search?rq={"data":{"type":"fulltext","value":"'+this.value+'"}}';
    }
});
$('#searchbtn').click(function(e){
    e.preventDefault();
    window.location = '/portal/search?rq={"data":{"type":"fulltext","value":"'+$('#searchbox').val()+'"}}';
});
