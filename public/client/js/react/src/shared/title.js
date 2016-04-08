/*
*Title : component expects props [data] = api record with data and indexTerms dictionary
****/

var React = require('react');
var _ = require('lodash');

module.exports = React.createClass({
    click: function(e){
        window.lodation
        window.location="/portal/records/"+this.props.data.uuid
    },
    taxaBreadCrumb: function(){


        /*['kingdom','phylum','class','order','family'].forEach(function(item){
            if(_.has(self.props.indexTerms,item)){
                order.push(item);
                values.push(self.props.record.indexTerms[item]);
            }
        });*/

        var output = [];
        
        return output;
    },
    render: function(){
        if(_.has(this.props.data,'indexTerms')){
            var title = '',info=[], taxonomy=['kingdom','phylum','class','order','family'];
            //build title
            var index = this.props.data.indexTerms, data=this.props.data.data;
            if(_.has(index,'scientificname')) { 
                title = _.capitalize(index['scientificname']);
                taxonomy.push('scientificname');
            }else if(_.has(index, 'genus')){
                title = _.capitalize(index['genus']);
                taxonomy.push('genus');
                if(_.has(index, 'specificepithet')){
                    title += " " + index['specificepithet'];
                    taxonomy.push('specificepithet');
                }
            }
            if(_.isEmpty(title)){
                title = <em>No Name</em>;
            } 
            //build info ids,inst
            info = _.without([data['dwc:scientificNameAuthorship']],undefined); 
            
            var link = null;
            
            var order = [], linktitle = [];
            _.each(taxonomy,function(item){
                if(_.has(index,item)){
                    order.push('"'+item+'":"'+encodeURI(index[item].replace(/"/g,'\\"'))+'"');
                    linktitle.push( item+': '+index[item].replace('"','') );
                }
            });

            var str = '/portal/search?rq={'+ order.join(',')+'}';
            if(this.props.mediaSearch){
                str += '&view=media';
            }
            var nameLink = <a title={'SEARCH ' + linktitle.join(', ')} href={str}>{title}</a>;

            if(this.props.includeLink){
                link = (<span className="title-link">
                    <a href={"/portal/records/"+this.props.data.uuid} title="go to associated specimen record">view specimen record</a>
                </span>)
            }
            
            return (
                <div id="title">
                    <h1 className="clearfix">
                        <span className="title">
                            <em>{nameLink}</em>
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
