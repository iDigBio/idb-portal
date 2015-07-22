/*
*Title : component expects props [data] = api record with data and indexTerms dictionary
****/

var React = require('react');
var _ = require('lodash');

module.exports = Title = React.createClass({
    click: function(e){
        window.location="/portal/records/"+this.props.data.uuid
    },
    render: function(){
        if(_.has(this.props.data,'indexTerms')){
            var title = '',info=[];
            //build title
            var index = this.props.data.indexTerms, data=this.props.data.data;
            if(_.has(index,'scientificname')) { 
                title = _.capitalize(index['scientificname']);
            }else if(_.has(index, 'genus')){
                title = _.capitalize(index['genus']);
                if(_.has(index, 'specificepithet')){
                    title += " " + index['specificepithet'];
                }
            }
            if(_.isEmpty(title)){
                title = <em>No Name</em>;
            } 
            //build info ids,inst
            info = _.without([data['dwc:scientificNameAuthorship']],undefined); 
            
            var link = null;
            
            if(this.props.includeLink){
                link = (<span className="title-link">
                    <a href={"/portal/records/"+this.props.data.uuid}>view specimen record</a>
                </span>)
            }
            
            return (
                <div id="title">
                    <h1 className="clearfix" onClick={this.click}>
                        <span className="title">
                            <em>{title}</em>
                            <span className="title-addition">
                                {info.join(', ')}
                            </span>
                            {link}
                        </span>
                    </h1>
                    <h2>
                        From <a href={'/portal/recordsets/'+this.props.attribution.uuid}>{this.props.attribution.name}</a>
                    </h2>
                </div>
            );             
        }else{

            return (
                <div id="title">
                    <h1><span className="title"><em>No Associated Specimen Record</em></span></h1>
                    <h2>
                        From <a href={'/portal/recordsets/'+this.props.attribution.uuid}>{this.props.attribution.name}</a>
                    </h2>
                </div>
            )
        }
      
    }
});
