import React from 'react'
import helpers from '../../lib/helpers'

const Collection = ({data}) => {
    var self=this;
    var regex = /(((ftp|https?):\/\/|www)[\-\w@:%_\+.~#?,&\/\/=;]+)/g;

    var rows =_.map(_.without(_.keys(data),'update_url'),function(key){
        var frags = key.split('_');
        for(var i=0; i<frags.length; i++) {
            frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
        }
       var val,link;
        if(_.isString(data[key]) && data[key].match(regex)!==null){
            link = data[key].trim();
            if(link.indexOf('http')!==0){
                link='http://'+link;
            }
            val = (
                <a target={"_outlink"} href={link} >
                    {link}
                </a>
            )
        }else{
            val = data[key];
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
        if(key=='recordsetQuery'){
            if(_.isString(val)){
                console.log(val)
                val = <a href={'/portal/search?rq='+val}>{val}</a>
            }
        }

        return (
            <tr key={key}>
                <td className="name">{frags.join(' ')}</td>
                <td>{val}</td>
            </tr>
        )
    })
    var title = data.institution;
    if(!_.isEmpty(data.collection)){
        title+=' - '+data.collection;
    }
    var url = UpdateLink(data);
    return (
        <div id="collection" className="col-lg-7 col-lg-offset-2">
            <h1>Collection</h1>
            <h2>{title}</h2>
            <a className="pull-right" href={url} target="_new">Update/Add Information</a>
            <table className="table table-bordered table-condensed table-striped">
                <tbody>{rows}</tbody>
            </table>
        </div>
    )

};

function UpdateLink (d){

        var url = 'https://docs.google.com/forms/d/1slWOvxuLpuPdvDihSibLQq9BPsOqPzK8Hh93zCW3dRI/viewform?';
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

    var result = encodedComponent === 'undefined' || encodedComponent === '' || encodedComponent === 'null' ? '' : '&entry.' + entryID + '=' + encodedComponent;

    return result;
};

export default Collection;