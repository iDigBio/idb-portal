
var React = require('react');
var dwc = require('../../lib/dwc_fields');
var _ = require('lodash');

var Media = React.createClass({displayName: "Media",
    error: function(event){
        $(event.currentTarget).attr('src','/portal/img/missing.svg');
    },
    render: function(){
        var link='';
        if(_.has(this.props.data,'ac:accessURI')){
            link = this.props.data['ac:accessURI'];
        }else if(_.has(this.props.data,'ac:bestQualityAccessURI')){
            link = this.props.data['ac:bestQualityAccessURI'];
        }else if(_.has(this.props.data, 'dcterms:identifier')){
            link = this.props.data['dcterms:identifier'];
        }

        return (
            React.createElement("div", {key: this.props.keyid, id: "media-wrapper", className: "clearfix"}, 
                React.createElement("a", {className: "clearfix", target: '_'+this.props.keyid, href: link, title: "click to open original media file"}, 
                    React.createElement("img", {className: "media", src: 'https://media.idigbio.org/mrlookup/'+this.props.keyid+'?size=webview', onError: this.error})
                ), 
                React.createElement("a", {href: link, download: this.props.keyid, target: '_'+this.props.keyid, className: "hidden-print"}, 
                    "Download Media File"
                )
            )
        );
    }
});

var Buttons = React.createClass({displayName: "Buttons",
    print: function(e){
        e.preventDefault();
        window.print();
    },
    render: function(){
        var el=[];
        if(_.has(this.props.data,'records')){
            var link = '/portal/records/'+this.props.data.records[0];
            el.push(
                React.createElement("a", {className: "btn button", href: link, key: link, keyid: link}, 
                    "Go To Record"
                )
            )
        }else{
            el.push(
                React.createElement("span", {className: "no-assoc"}, "Media is not associated with any record")
            )
        }
        var rlink = '/portal/recordsets/'+this.props.data.recordset;

        el.push(
            React.createElement("a", {className: "btn button", href: rlink, key: rlink, keyid: rlink}, 
                "Go To Recordset"
            )
        );

        el.push(
            React.createElement("a", {href: "#raw", "data-toggle": "modal", "data-target": "#raw", className: "btn button", key: 'raw-data'}, 
                "View Raw Data"
            )            
        );
        
        return (
            React.createElement("div", {id: "action-buttons", key: 'buttons'}, 
                el, 
                React.createElement("button", {className: "btn button", title: "print this page", onClick: this.print}, 
                    "Print"
                )
            )
        );
    }
});

var Table = React.createClass({displayName: "Table",
    render: function(){
        var order=[],rows=[],self=this;

        //make ordered name keys
        _.each(dwc.order.media,function(val){
            if(_.has(self.props.record, val)){
                order.push(val);
            }
        });
        //add unknown keys to end of list
        var dif = _.difference(Object.keys(this.props.record),order);
        var merged = order.concat(dif), count=0;
        var regex = /(\bhttps?:\/\/(\S|\w)+)/;
        _.each(order,function(key){
            var name = _.isUndefined(dwc.names[key]) ? key: dwc.names[key];
            var val = self.props.record[key];
            if(_.isString(val)){
                var str;
                if(val.indexOf('<a')===0){
                    str = val;
                }else{
                    str = val.replace(regex, "<a href=\"$1\">$1</a>");
                }
                rows.push(
                    React.createElement("tr", {key: count}, 
                        React.createElement("td", {className: "name"}, name), 
                        React.createElement("td", {className: "value", dangerouslySetInnerHTML: {__html: str}})
                    )
                );                
            }else if(_.isArray(val)){
                rows.push(
                    React.createElement("tr", {key: count}, 
                        React.createElement("td", {className: "name"}, name), 
                        React.createElement("td", {className: "value"}, val.join(', '))
                    )
                );                 
            }else{
                rows.push(
                    React.createElement("tr", {key: count}, 
                        React.createElement("td", {className: "name"}, name), 
                        React.createElement("td", {className: "value"}, val)
                    )
                );                 
            }
            count++
        });

        return (
            React.createElement("div", {id: "meta-table"}, 
                React.createElement("table", null, 
                    rows
                )
            )
        );
    }
});

var Group = React.createClass({displayName: "Group",
    error: function(event){
        $(event.currentTarget).attr('src','/portal/img/missing.svg');
    },
    render: function(){
        if(_.has(this.props.record, 'indexTerms') && this.props.record.indexTerms.mediarecords.length > 1){
            var imgs = [];
            var media = this.props.record.indexTerms.mediarecords;
            for(id in media){
                if(media[id] != this.props.keyid){
                    imgs.push(
                        React.createElement("a", {href: '/portal/mediarecords/'+media[id], title: "click to open media record", key: media[id]}, 
                            React.createElement("img", {className: "gallery-image", src: 'https://media.idigbio.org/mrlookup/'+media[id]+'?size=webview', onError: this.error})
                        )
                    )                    
                }
            }
            return (
                React.createElement("div", {id: "other-images", className: "clearfix"}, 
                    React.createElement("h4", {className: "title"}, "Other Media"), 
                    React.createElement("div", {id: "images-wrapper"}, 
                        imgs
                    )
                )
            )
        }else{
            return React.createElement("span", null)
        }
    }
});

var Provider = require('./shared/provider');
var Raw = require('./shared/raw');
var Title = require('./shared/title');

module.exports = React.createClass({displayName: "exports",
    render: function(){
        var source = this.props.mediarecord;
        var info=[];
        
        return (
            React.createElement("div", {className: "container-fluid"}, 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-lg-12", id: "container"}, 
                        React.createElement("div", {id: "data-container", className: "clearfix"}, 
                            React.createElement(Title, {data: this.props.record}), 
                            React.createElement("div", {id: "data-content"}, 
                                React.createElement(Media, {key: source.uuid+'_media', keyid: source.uuid, data: source.data})
                            ), 
                            React.createElement("div", {id: "data-meta", className: "clearfix"}, 
                                React.createElement("div", {id: "actions", className: "hidden-print"}, 
                                    React.createElement(Buttons, {data: source.indexTerms})
                                ), 
                                React.createElement("div", {id: "data-table", className: "clearfix"}, 
                                    React.createElement("h4", {className: "title"}, "Media Metadata"), 
                                    React.createElement(Table, {record: source.data})
                                )
                            ), 
                            React.createElement(Group, {record: this.props.record, keyid: source.uuid}), 
                            React.createElement(Provider, {data: this.props.mediarecord.attribution})
                        )
                    )
                ), 
                React.createElement(Raw, {data: source})
            )
        )
    }
})
