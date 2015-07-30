
var React = require('react');
var Griddle = require('griddle-react');
var helpers = require('../../lib/helpers');

var openMapPopup;
module.exports = React.createClass({displayName: "exports",
    render: function(){
        openMapPopup=this.props.openMapPopup;
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
                "displayName": "Institution"
                
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
                
            },
            {
                "columnName": "collection_uuid",
                "locked":false,
                "visibile":true,
                "customComponent": MapLink,
                "displayName": "Show On Map"
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
            React.createElement(Griddle, {
                showSettings: true, 
                results: this.props.data, 
                showFilter: true, 
                resultsPerPage: 20, 
                columns: ['institution','collection',
                'contact','contact_role', 'update_url', 'collection_uuid'], 
                columnMetadata: columnMeta.concat(cols), 
                enableInfiniteScroll: true, bodyHeight: 400, 
                useFixedHeader: true})
        )
    }
});

var LinkCell = React.createClass({displayName: "LinkCell",
    render: function(){
        var d = this.props.data;
        if(_.isEmpty(d) || d.toLowerCase() == 'na'){
            return React.createElement("span", null)
        }else{
            var l;
            if(d.match('http')==null){
                l='http://'+d;
            }else{
                l=d;
            }
            return (
                React.createElement("a", {href: l, target: "_new"}, "Link")
            )            
        }
    }
});

var LinkName = React.createClass({displayName: "LinkName",
    render: function(){
        var d = this.props.data;
        if(d == null || d.toLowerCase() == 'na' ){
            return React.createElement("span", null)
        }else{
            var href = '/portal/collections/'+this.props.rowData.collection_uuid.split('urn:uuid:')[1];
            return (
                React.createElement("a", {href: href, target: "_collection_"+this.props.rowData.collection_uuid}, d)
            )            
        }
    }
});

var Email = React.createClass({displayName: "Email",
    render: function(){
        var d = this.props.data;
        
        if(helpers.testEmail(d)){
            return React.createElement("a", {href: 'mailto:'+d}, d)
        }else{
            return React.createElement("span", null)
        }
    }
});

var Recordsets = React.createClass({displayName: "Recordsets",
    render: function(){
        var d = this.props.data;
        
        if(_.isString(d)){
            var records = d.split(/,/);
            var links=[];
            records.forEach(function(item){
                if(item.trim().length > 0){
                    links.push(
                        React.createElement("a", {href: '/portal/recordsets/'+item.trim(), key: item}, item)
                    )
                }
            })
            return React.createElement("span", null, 
                    links
                    )
        }else{
            return React.createElement("span", null)
        }
    }
});

var UpdateLink = React.createClass({displayName: "UpdateLink",
    render: function(){
        var d=this.props.data;
        return React.createElement("a", {href: d, target: "_new"}, "Update/Add Information")
    }
});

var MapLink = React.createClass({displayName: "MapLink",
    openClick: function(e){
        e.preventDefault()
        openMapPopup(e.target.attributes.href.value);
    },
    render: function(){
        var d=this.props.data;
       
        if(_.isNull(this.props.rowData.lat) || _.isNull(this.props.rowData.lon)){
            return React.createElement("span", null)
        }else{
            return React.createElement("a", {href: d, target: "_new", onClick: this.openClick}, "Show On Map")
        }
    }
});