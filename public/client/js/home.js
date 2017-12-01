
//var React = require('react');
//var HomePage = React.createFactory(require('./react/build/home'));
var idbapi = require('./lib/idbapi');


var colors = ['#6C477C','#56E4F4','#194B94','#ED2E2E','#C86B61'];
var kingdomColor={'Plantae': '#6aaa51','Fungi':'#d3b833' ,'Chromista': '#cf7a0b','Animalia': '#3782cd', 'Protozoa': '#DD5656' },colorsIndex=0;
var others = ["incertae","ichnofossil","taxon indet.","monocotyledonae","pteridophyta","dicotyledonae","protista","protoctista","monera","incertae sedis"]
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
var sortFunc = function(a,b){
    if (a[1] > b[1]) {
        return -1;
    }
    if (a[1] < b[1]) {
        return 1;
    }

    // a must be equal to b
    return 0;
};


//record pie chart
var record = {"rq":{"kingdom":{"type":"exists"}},"top_fields": ["kingdom"]};

idbapi.summary('top/records/',record,function(response){

    var king=[],other=['other'],colorOrder=[];
    _.each(response.kingdom, function(v,k){
        if(others.indexOf(k)===-1){
            king.push([helpers.firstToUpper(k),v.itemCount]);
        }else{
            other.push(v.itemCount)
        }
    })
    king.push(other);
    king.sort(sortFunc);
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

//media pie chart
var media = {"rq":{"kingdom":{"type":"exists"},"hasImage":true},"top_fields": ["kingdom"]};

idbapi.summary('top/records/',media,function(response){

    var king=[],other=['other'],colorOrder=[];
    _.each(response.kingdom, function(v,k){
        if(others.indexOf(k)===-1){
            king.push([helpers.firstToUpper(k),v.itemCount]);
        }else{
            other.push(v.itemCount)
        }
    });
    king.push(other);
    king.sort(sortFunc);
    
    king.forEach(function(item){
        colorOrder.push(setGetColor(item[0]));
    });
    
    var chart = c3.generate({
        data:{
            columns: king,
            type: 'pie',
            onclick: function(d,el){
                if(d.name.toLowerCase()!='other'){
                    window.location = '/portal/search?rq={"kingdom":"'+d.name+'"}&view=media';
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

// record counts
idbapi.summary('count/records/', function(resp) {
    $('#recordcount').html(formatNum(JSON.parse(resp).itemCount));
});
idbapi.summary('count/media/', function(resp) {
    $('#mediacount').html(formatNum(JSON.parse(resp).itemCount));
});
idbapi.summary('count/recordset/?rsq={"data.ingest": true}', function(resp) {
    $('#recordsets-total').html(formatNum(JSON.parse(resp).itemCount));
});

function searchRq(value){
    var rq, type=$('#select-field').val();
    switch(type){
        case 'fulltext':
            rq = '{"data":{"type":"fulltext","value":"'+value+'"}}';
            break;
        case 'scientificname':
            rq = '{"scientificname":"'+value+'"}';
            break;
    }
    window.location = '/portal/search?rq='+rq;
}

$('#searchbox').keypress(function(e) {
    if(e.which == 13) {
        e.preventDefault();
        searchRq(this.value);
    }
});

$('#searchbtn').click(function(e){
    e.preventDefault();
    searchRq($('#searchbox').val());
});
