
var React = require('react');
var Chartist = React.createFactory(require('react-chartist'));

module.exports = React.createClass({displayName: "exports",

    render: function(){
        var kingdoms = {
            "incertae": "other",
            "ichnofossil": "other",
            "taxon indet.": "other"
        }
        var results={};
        var chart = {"series":[],"labels":[]};
        var king;
        _.each(response.kingdom, function(v,k){
            if(_.isUndefined(kingdoms[k])){
                king=k;
            }else{
                king='other';
            }
            if(_.isUndefined(results[king])){
                results[king]=0;
            }
            results[king]+= v.itemCount;
        })
      
        _.each(results, function(v,k){
            chart.series.push(v);
            chart.labels.push(k + ' '+v);
        })
        var options = {
              chartPadding: 30,
              labelOffset: 30,
              labelDirection: 'explode'
        }
        return(
            React.createElement("div", null, 
                React.createElement(Chartist, {className: "ct-chart ct-golden-section", data: chart, type: 'Pie'})
            )
        )
    }
})