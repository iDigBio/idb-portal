
var React = require('react');
var Griddle = require('griddle-react');
var helpers = require('../../lib/helpers');

module.exports = React.createClass({
    render: function(){
        var columnMeta=[{
                "columnName": "collection_url",
                "locked": false,
                "visible": true,
                "cssClassName":"link-cell",
                "customComponent": LinkCell,
                "displayName": "Institution URL"
            },
            {
                "columnName": "collection_catalog_url",
                "cssClassName":"link-cell",
                "locked": false,
                "visible": true,
                "customComponent": LinkCell,
                "displayName": "Catalog URL"
                
            },
            {
                "columnName": "institution",
                "locked": false,
                "visible": true,
                "customComponent": LinkName,
                "displayName": "Institution Name"
                
            },
            {
                "columnName": "contact_email",
                "locked": false,
                "visible": true,
                "customComponent": Email,
                "displayName": "Contact Email"
                
            },
            {
                "columnName": "recordsets",
                "locked": false,
                "visible": true,
                "customComponent": Recordsets,
                "displayName": "Recordsets"
                
            },
            {
                "columnName": "update_url",
                "locked": false,
                "visible": true,
                "customComponent": UpdateLink,
                "displayName": "Update/Add Information"
                
            }
        ]
        var cols = _.map(_.without(_.keys(this.props.data[0]),_.map(columnMeta,function(i){return i.columnName})),function(item){
            var frags = item.split('_');
            for (i=0; i<frags.length; i++) {
                frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
            }
            return {"columnName": item, "displayName": frags.join(' ')}
        });

        return (
            <Griddle 
                showSettings={true} 
                results={this.props.data} 
                showFilter={true} 
                resultsPerPage={20}
                columns={['institution','collection',
                'contact','contact_role', 'update_url']}  
                columnMetadata={columnMeta.concat(cols)}
                enableInfiniteScroll={true} bodyHeight={400} 
                useFixedHeader={true} />
        )
    }
});

var LinkCell = React.createClass({
    render: function(){
        var d = this.props.data;
        if(_.isEmpty(d) || d.toLowerCase() == 'na'){
            return <span/>
        }else{
            var l;
            if(d.match('http')==null){
                l='http://'+d;
            }else{
                l=d;
            }
            return (
                <a href={l} target="new">Link</a>
            )            
        }
    }
});

var LinkName = React.createClass({
    render: function(){
        var d = this.props.data;
        if(d == null || d.toLowerCase() == 'NA' ){
            return <span/>
        }else{
            var href = '/portal/collections/'+this.props.rowData.collection_uuid.split('urn:uuid:')[1];
            return (
                <a href={href} target="new">{d}</a>
            )            
        }
    }
});

var Email = React.createClass({
    render: function(){
        var d = this.props.data;
        
        if(helpers.testEmail(d)){
            return <a href={'mailto:'+d}>{d}</a>
        }else{
            return <span/>
        }
    }
});

var Recordsets = React.createClass({
    render: function(){
        var d = this.props.data;
        
        if(_.isString(d)){
            var records = d.split(/,/);
            var links=[];
            records.forEach(function(item){
                if(item.trim().length > 0){
                    links.push(
                        <a href={'/portal/recordsets/'+item.trim()} key={item}>{item}</a>
                    )
                }
            })
            return <span>
                    {links}
                    </span>
        }else{
            return <span/>
        }
    }
});

var UpdateLink = React.createClass({
    render: function(){
        var d=this.props.data;
        return <a href={d} target="_new">Update/Add Information</a>
    }
});