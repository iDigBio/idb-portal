/**
 * @jsx React.DOM
 */
var React = require('react');
var Chartist = React.createFactory(require('react-chartist'));

module.exports = React.createClass({displayName: 'exports',

    render: function(){
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
        _.each(this.props.data.kingdom, function(v,k){
            if(_.isUndefined(results[kingdoms[k]])){
                results[kingdoms[k]]=0;
            }
            results[kingdoms[k]]+= v.itemCount;
     
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
            React.DOM.div(null, 
                Chartist({className: "ct-chart ct-golden-section", data: chart, type: 'Pie'})
            )
        )
    }
})