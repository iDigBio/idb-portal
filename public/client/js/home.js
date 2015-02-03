/**
 * @jsx React.DOM
 */
//var React = require('react');
//var HomePage = React.createFactory(require('./react/build/home'));

var query = {"fields": ["kingdom"]};
$.ajax('//beta-search.idigbio.org/v2/summary/top/basic/',{
    data: JSON.stringify(query),
    success: function(response){
        /*React.render(
            <HomePage data={response} />,
             document.getElementById('react-wrapper')
        )*/
        var kingdoms = {
            "animalia": "Animalia",
            "plantae": "Plantae",
            "fungi": "Fungi",
            "Animalia": "Animalia",
            "Plantae": "Plantae",
            "dicotyledonae": "Plantae",
            "monocotyledonae": "Plantae",
            "Fungi": "Fungi",
            "animals": "Animalia",
            "ascomycota": "Fungi",
        }
        var results={};
        var chart = {"series":[],"labels":[]};
        _.each(response.kingdom, function(v,k){
            if(_.isUndefined(results[kingdoms[k]])){
                results[kingdoms[k]]=0;
            }
            results[kingdoms[k]]+= v.itemCount;
     
        })
      
        _.each(results, function(v,k){
            chart.series.push(v);
            chart.labels.push(k );
        })
        var options = {
              chartPadding: 30,
              labelOffset: 30,
              labelDirection: 'explode'
        }
        new Chartist.Pie('.ct-chart',chart);
    },
    dataType: 'json',
    contentType: 'application/json',
    type: 'POST'
});

