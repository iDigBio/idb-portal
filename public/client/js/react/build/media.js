
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
            React.createElement("div", {key: this.props.keyid, id: "media-wrapper", className: "scrollspy section clearfix"}, 
                React.createElement("a", {className: "clearfix", target: '_'+this.props.keyid, href: link, title: "click to open original media file"}, 
                    React.createElement("img", {className: "media", src: 'https://media.idigbio.org/mrlookup/'+this.props.keyid+'?size=webview', onError: this.error})
                ), 
                React.createElement("a", {className: "media-link hidden-print", href: link, download: this.props.keyid, target: '_'+this.props.keyid}, 
                    "Download Media File"
                )
            )
        );
    }
});

var Table = React.createClass({displayName: "Table",
    getInitialState: function(){
        return {active: 'record'};
    },
    formatJSON: function(json){
        if (typeof json != 'string') {
             json = JSON.stringify(json, undefined, 2);
        }
        
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    },
    tabClick: function(e){
        e.preventDefault();
        this.setState({active: e.target.attributes['data-tab'].value});
    },
    render: function(){
        var order=[],rows=[],self=this;

        //make ordered name keys
        _.each(dwc.order.media,function(val){
            if(_.has(self.props.record.data, val)){
                order.push(val);
            }
        });
        //add unknown keys to end of list
        var dif = _.difference(Object.keys(this.props.record.data),order);
        var merged = order.concat(dif), count=0;
        var regex = /(\bhttps?:\/\/(\S|\w)+)/;
        _.each(order,function(key){
            var name = _.isUndefined(dwc.names[key]) ? key: dwc.names[key];
            var val = self.props.record.data[key];
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
            count++;
        });

        return (
            React.createElement("div", {id: "data-table", className: "scrollspy"}, 
                React.createElement("ul", {onClick: this.tabClick}, 
                    React.createElement("li", {className: this.state.active == 'record' ? 'active' : '', "data-tab": "record"}, "Data"), 
                    React.createElement("li", {className: this.state.active == 'raw' ? 'active' : '', "data-tab": "raw"}, "Raw")
                ), 
                React.createElement("section", {id: "record", className: "clearfix", style: {display: (this.state.active == 'record' ? 'block' : 'none' )}}, 
                    React.createElement("table", {className: "table table-striped table-condensed table-bordered"}, 
                    rows
                    )
                ), 
                React.createElement("section", {id: "raw", style: {display: (this.state.active == 'raw' ? 'block' : 'none' )}}, 
                    React.createElement("p", {id: "raw-body", dangerouslySetInnerHTML: {__html: this.formatJSON(this.props.record)}}
                    )
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
                React.createElement("div", {id: "other-images", className: "clearfix scrollspy section"}, 
                    React.createElement("h4", {className: "title"}, "Other Media"), 
                    React.createElement("div", {id: "images-wrapper"}, 
                        imgs
                    )
                )
            )
        }else{
            return null;
        }
    }
});

var Provider = require('./shared/provider');
var Raw = require('./shared/raw');
var Title = require('./shared/title');

module.exports = React.createClass({displayName: "exports",
    taxaBreadCrumbs: function(){
        var order = [], values = [], self = this;
        
        ['kingdom','phylum','class','order','family'].forEach(function(item){
            if(_.has(self.props.record.indexTerms,item)){
                order.push(item);
                values.push(self.props.record.indexTerms[item]);
            }
        });

        var output = [];
        
        order.forEach(function(item,index){
            var search = [], title = [];
            for(var i = 0; i <= index; i++){
                search.push('"'+order[i]+'":'+'"'+values[i]+'"');
                title.push(order[i]+': '+values[i]);
            }
            output.push(
                React.createElement("a", {
                    key: 'bread-'+item, 
                    href: '/portal/search?rq={'+search.join(',')+'}&view=images', 
                    title: 'SEARCH IMAGES '+title.join(', ')
                }, _.capitalize(values[index]))
            );
            if((order.length-1) > index){
                output.push(React.createElement("span", {key: 'arrow'+index}, " > "));
            }
        });

        return output;
    },
    navList: function(){

        var media = null;
        //var med = this.props.indexTerms.mediarecords
        
        if( _.has(this.props.record,'indexTerms') && this.props.record.indexTerms.mediarecords.length > 1){
            media = React.createElement("li", null, React.createElement("a", {href: "#other-images"}, "Other Media"))
        }

        return(
            React.createElement("ul", {id: "side-nav-list"}, 
                React.createElement("li", {className: "title"}, "Contents"), 
                React.createElement("li", null, React.createElement("a", {href: "#media-wrapper"}, "Media")), 
                media, 
                React.createElement("li", null, React.createElement("a", {href: "#attribution"}, "Attribution")), 
                React.createElement("li", null, React.createElement("a", {href: "#data-table"}, "Data"))
            )  
        )
    },
    render: function(){
        var source = this.props.mediarecord;
        var info=[];
        
        return (
            React.createElement("div", {className: "container-fluid"}, 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-lg-7 col-lg-offset-2 col-md-10 col-sm-10", id: "container"}, 
                        React.createElement("h1", {id: "banner"}, "Media Record"), 
                        React.createElement("span", {id: "summary"}, this.taxaBreadCrumbs()), 
                        React.createElement(Title, {data: this.props.record, attribution: this.props.mediarecord.attribution, includeLink: true}), 
                        React.createElement(Media, {key: source.uuid+'_media', keyid: source.uuid, data: source.data}), 
                        React.createElement(Group, {record: this.props.record, keyid: source.uuid}), 
                        React.createElement(Provider, {data: this.props.mediarecord.attribution}), 
                        React.createElement(Table, {record: source})
                    ), 
                    React.createElement("div", {className: "col-lg-2 col-md-2 col-sm-2"}, 
                        React.createElement("div", {id: "side-nav"}, 
                            this.navList()
                        )
                    )
                )
            )
        )
    }
})
