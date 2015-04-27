/*
*Title : component expects props [data] = api record with data and indexTerms dictionary
****/

var React = require('react');
var _ = require('lodash');

module.exports = Title = React.createClass({displayName: "Title",
    render: function(){
        var title = '',info=[];
        //build title
        var index = this.props.data.indexTerms, data=this.props.data.data;
        if(_.has(index,'scientificname')) { 
            title = _.capitalize(index['scientificname']);
        }else if(_.has(index, 'genus')){
            title = _.capitalize(index['genus']);
            if(_.has(index, 'specificepithet')){
                title += index['specificepithet'];
            }
        }
        if(_.isEmpty(title)){
            title = React.createElement("em", null, "No Name");
        } 
        //build info ids,inst
        info = _.without([data['dwc:scientificNameAuthorship'],data['dwc:institutionCode'],index.eventdate,data['dwc:collectionCode'],data['dwc:catalogNumber']],undefined); 

        return (
            React.createElement("h1", {id: "title", className: "clearfix"}, 
                React.createElement("em", null, title), 
                React.createElement("span", {className: "title-addition"}, 
                    info.join(', ')
                )
            )
        );       
    }
});