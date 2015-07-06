/*
*Title : component expects props [data] = api record with data and indexTerms dictionary
****/

var React = require('react');
var _ = require('lodash');

module.exports = Title = React.createClass({displayName: "Title",
    click: function(e){
        window.location="/portal/records/"+this.props.data.uuid
    },
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
            React.createElement("div", {id: "title"}, 
                React.createElement("h1", {className: "clearfix", onClick: this.click}, 
                    React.createElement("span", {className: "title"}, 
                        React.createElement("em", null, title), 
                        React.createElement("span", {className: "title-addition"}, 
                            info.join(', ')
                        )
                    )
                ), 
                React.createElement("h2", null, 
                    "From:  ", React.createElement("a", {href: '/portal/recordsets/'+this.props.data.attribution.uuid}, this.props.data.attribution.name)
                )
            )
        );       
    }
});