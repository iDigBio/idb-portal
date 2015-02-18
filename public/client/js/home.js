
//var React = require('react');
//var HomePage = React.createFactory(require('./react/build/home'));
var base = '//beta-search.idigbio.org';
var record = {"rq":{"kingdom":{"type":"exists"}},"fields": ["kingdom"]};
$.ajax(base+'/v2/summary/top/basic/',{
    data: JSON.stringify(record),
    success: function(response){
        /*React.render(
            <HomePage data={response} />,
             document.getElementById('react-wrapper')
        )*/
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
                pattern: ['#cf7a0b','#3782cd','#d3b833','#6aaa51']
            }
        })
    },
    dataType: 'json',
    contentType: 'application/json',
    type: 'POST'
});

var media = {"rq":{"kingdom":{"type":"exists"},"hasImage":true},"fields": ["kingdom"]};

$.ajax(base+'/v2/summary/top/basic/',{
    data: JSON.stringify(media),
    success: function(response){
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
            bindto:'#media-chart',
            color:{
                pattern: ['#cf7a0b','#3782cd','#d3b833','#6aaa51']
            }
        })
    },
    dataType: 'json',
    contentType: 'application/json',
    type: 'POST'
});


$.ajax(base+'/v2/summary/count/basic/',{
    success: function(resp){
        $('#recordcount').html(resp.itemCount);
    },
    dataType: 'json',
    contentType: 'application/json',
    type: 'POST'
})
$.ajax(base+'/v2/summary/count/media/',{
    success: function(resp){
        $('#mediacount').html(resp.itemCount);
    },
    dataType: 'json',
    contentType: 'application/json',
    type: 'POST'
})
$.ajax(base+'/v2/summary/count/recordset/',{
    success: function(resp){
        $('#recordsetcount').html(resp.itemCount);
    },
    dataType: 'json',
    contentType: 'application/json',
    type: 'POST'
})