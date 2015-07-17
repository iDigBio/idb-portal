
var React = require('react');
var helpers = require('../../lib/helpers');

module.exports = Collection = React.createClass({

    render: function(){
        var self=this;
        var regex = /(((ftp|https?):\/\/|www)[\-\w@:%_\+.~#?,&\/\/=;]+)/g;

        var rows =_.map(_.without(_.keys(self.props.data),'update_url'),function(key){
            var frags = key.split('_');
            for(i=0; i<frags.length; i++) {
                frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
            }
           var val,link;
            if(_.isString(self.props.data[key]) && self.props.data[key].match(regex)!==null){
                link = self.props.data[key].trim();
                if(link.indexOf('http')!==0){
                    link='http://'+link;
                }  
                val = (
                    <a target={"_outlink"} href={link} >
                        {link}
                    </a>
                )              
            }else{
                val = self.props.data[key];
            }
            if(key=='contact_email' && helpers.testEmail(val)){
                val = <a href={'mailto:'+val}>{val}</a>
            }
            if(key=='recordsets'){
                if(_.isString(val)){
                    var records = val.split(/,/);
                    var links=[];
                    records.forEach(function(item){
                        if(item.trim().length > 0){
                            links.push(
                                <a href={'/portal/recordsets/'+item.trim()} key={item}>{item}</a>
                            )
                        }
                    })
                    val = <span>{links}</span>
                }
            }
            //var val = self.props.data[key];
            return (
                <tr key={key}>
                    <td className="name">{frags.join(' ')}</td>
                    <td>{val}</td>
                </tr>
            )
        })
        var title = this.props.data.institution;
        if(!_.isEmpty(this.props.data.collection)){
            title+=' - '+this.props.data.collection;
        }
        return (
            <div id="collection" className="col-lg-7 col-lg-offset-2">
                <h1>Collection</h1>
                <h2>{title}</h2>
                <a className="pull-right" href={this.props.data.update_url} target="_new">Update/Add Information</a>
                <table className="table table-bordered table-condensed table-striped">
                    {rows}
                </table>
            </div>
        )
    }
});