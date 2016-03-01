
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
        var url = UpdateLink(this.props.data);
        return (
            <div id="collection" className="col-lg-7 col-lg-offset-2">
                <h1>Collection</h1>
                <h2>{title}</h2>
                <a className="pull-right" href={url} target="_new">Update/Add Information</a>
                <table className="table table-bordered table-condensed table-striped">
                    {rows}
                </table>
            </div>
        )
    }
});


function UpdateLink (d){

        var url = 'https://docs.google.com/forms/d/1slWOvxuLpuPdvDihSibLQq9BPsOqPzK8Hh93zCW3dRI/viewform?';
        url += 'entry.823080433=the+collection+is+already+in+the+list'
        url += GoogleFormQS(326174790, d.institution);
        url += GoogleFormQS(2031121141, d.collection);
        url += GoogleFormQS(4068754, d.institution_code);
        url += GoogleFormQS(1582913154, d.collection_code);
        url += GoogleFormQS(1336841557, d.collection_url);
        url += GoogleFormQS(103879345, d.collection_catalog_url );
        url += GoogleFormQS(107456176, d.geographic_range );
        url += GoogleFormQS(879476273, d.taxonomic_coverage );
        url += GoogleFormQS(417603227, d.collection_size );
        url += GoogleFormQS(1321049572, d.contact );
        url += GoogleFormQS(1687847097, d.contact_role );
        url += GoogleFormQS(1086198428, d.contact_email );
        url += GoogleFormQS(246950189, d.mailing_address );
        url += GoogleFormQS(1584255348, d.mailing_city );
        url += GoogleFormQS(1966582743, d.mailing_state );
        url += GoogleFormQS(256217142, d.mailing_zip );
        url += GoogleFormQS(447546773, d.physical_address );
        url += GoogleFormQS(1565624766, d.physical_city );
        url += GoogleFormQS(1920508789, d.physical_state );
        url += GoogleFormQS(1022645685, d.physical_zip );
        url += GoogleFormQS(764919322, d.collection_uuid );
        url += GoogleFormQS(1499949381, d.recordsets );

        return url;
};


function GoogleFormQS(entryID, querypart) {
    var encodedComponent = encodeURIComponent(querypart);

    result = encodedComponent === 'undefined' || encodedComponent === '' || encodedComponent === 'null' ? '' : '&entry.' + entryID + '=' + encodedComponent;

    return result;
};