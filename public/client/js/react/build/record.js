
var React = require('react')
var dwc = require('../../lib/dwc_fields');
var _ = require('lodash');
var fields = require('../../lib/fields');

var Row = React.createClass({displayName: "Row",
    render: function(){
        var name = _.isUndefined(dwc.names[this.props.keyid]) ? this.props.keyid : dwc.names[this.props.keyid];
        var regex = /[\A|\s]+(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=;]+)/g;
        var str = this.props.data.replace(regex, function(match){
            var href = match.replace(/(;|=|\+|!|&|,|\(|\)|\*|'|#)$/, '');
            return "<a target=\"_outlink\" href=\""+href+"\">"+match+"</a>";
           
        });
        return (
            React.createElement("tr", {className: "data-row"}, 
                React.createElement("td", {className: "field-name", style: {width:'50%'}}, name), 
                React.createElement("td", {className: "field-value", style: {width:'50%'}, dangerouslySetInnerHTML: {__html: str}})
            )
        );   
    }
});

var Section = React.createClass({displayName: "Section",
    render: function(){
        var rows = [],self=this;
        var data = this.props.data;

        _.each(data,function(fld){
            var key = Object.keys(fld)[0];
            if(_.isString(fld[key])){
                rows.push(React.createElement(Row, {key: key, keyid: key, data: fld[key]}));
            } 
        });        
        /*_.each(data, function(fld){
            var key = Object.keys(fld)[0];
            var name = _.isUndefined(dwc.names[key]) ? key : dwc.names[key];
            var regex = /(https?:\/\/(\S|\w)+)/;
            var val = fld[key];
            if(_.isString(val)){
               val = val.replace(regex, "<a target=\"_outlink\" href=\"$1\">$1</a>");
            }
            rows.push( 
                <Row keyid={key} key={key} className="data-row">
                    <td className="field-name">{name}</td>
                    <td className="field-value" dangerouslySetInnerHTML={{__html: val}}></td>
                </tr>
            ); 
        });*/
        var cl = "section visible-print-block";
        if(this.props.active){
            cl="section";
        }
        return (
            React.createElement("div", {id: this.props.name, className: cl}, 
                React.createElement("h5", null, dwc.names[this.props.name]), 
                React.createElement("table", {className: "table table-striped table-condensed table-bordered"}, 
                    rows
                )
            )
        );
    }
});

var Flags = React.createClass({displayName: "Flags",
    render: function(){
        var rows = _.map(this.props.flags, function(flag){
            return (
                React.createElement("tr", null, React.createElement("td", null, flag))
            )
        })

        return (
            React.createElement("div", {id: "flags", style: {display: (this.props.active ? 'block' : 'none' )}}, 
                React.createElement("table", {className: "table table-striped table-bordered table-condensed"}, 
                    rows
                )
            )
        )
    }
});

var Record = React.createClass({displayName: "Record",
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
    getInitialState: function(){
        return {active: "record"};
    },
    tabClick: function(e){
        e.preventDefault();
        this.setState({active: e.target.attributes['data-tab'].value});
    },
    render: function(){
        var has = [];
        var sorder = ['taxonomy','specimen','collectionevent','locality','paleocontext','other'];
        var record = [], tabs = [], self = this, flags = null, flagsTab = null;
        var cnt = 0;
        
        sorder.forEach(function(sec,index){
            if(_.has(self.props.record,sec)){
                var active=true;
                if(cnt===0){
                    active=true;
                }
                //tabs.push(<Tab key={'tab-'+sec} keyid={'tab-'+sec} name={sec} active={active} />)
                record.push(React.createElement(Section, {key: 'sec-'+sec, key: 'sec-'+sec, name: sec, data: self.props.record[sec], active: active}));
                cnt++;
            } 
        });

        if(this.props.raw.indexTerms.flags){
            flags = React.createElement(Flags, {flags: this.props.raw.indexTerms.flags, active: this.state.active == 'flags'});
            flagsTab = React.createElement("li", {className: this.state.active == 'flags' ? 'active' : '', "data-tab": "flags"}, "Flags");
        }

        return (
            React.createElement("div", {id: "data", className: "scrollspy section"}, 
                
                React.createElement("ul", {onClick: this.tabClick}, 
                    React.createElement("li", {className: this.state.active == 'record' ? 'active' : '', "data-tab": "record"}, "Data"), 
                    flagsTab, 
                    React.createElement("li", {className: this.state.active == 'raw' ? 'active' : '', "data-tab": "raw"}, "Raw")
                ), 
                React.createElement("div", {id: "record", className: "clearfix", style: {display: (this.state.active == 'record' ? 'block' : 'none' )}}, 
                    record
                ), 
                flags, 
                React.createElement("div", {id: "raw", style: {display: (this.state.active == 'raw' ? 'block' : 'none' )}}, 
                    React.createElement("p", {id: "raw-body", dangerouslySetInnerHTML: {__html: this.formatJSON(this.props.raw)}}
                    )
                )
            )
        );
    }
});

var Img = React.createClass({displayName: "Img",
    error: function(event){
        $(event.currentTarget).attr('src','/portal/img/missing.svg');
    },
    render: function(){
        return (
            React.createElement("a", {href: '/portal/mediarecords/'+this.props.keyid, title: "click to open media record"}, 
                React.createElement("img", {className: "gallery-image", onError: this.error, src: 'https://media.idigbio.org/mrlookup/'+this.props.keyid+'?size=webview'})
            )
        );
    }
});

var Gallery = React.createClass({displayName: "Gallery",
    render: function(){
        if(_.has(this.props.data,'mediarecords')){
            
            var imgs = [];

            _.each(this.props.data.mediarecords,function(item){
                imgs.push(React.createElement(Img, {key: item, keyid: item}));
            })
        
            return (
                React.createElement("div", {id: "media", className: "scrollspy section"}, 
                    React.createElement("h4", {className: "title"}, "Media"), 
                    React.createElement("div", {id: "gallery"}, 
                        imgs
                    )
                )
            );
        }else{
            return React.createElement("span", null)
        }
    }
});

var Map = React.createClass({displayName: "Map",
    render: function(){
        if(_.has(this.props.data,'geopoint')){
            return (
                React.createElement("div", {id: "map", className: "clearfix scrollspy section"}, 
                    
                    React.createElement("div", {id: "map-wrapper"}, 
                        React.createElement("div", {id: "map-box"})
                    )
                )
            )
        }else{
            return React.createElement("span", null)
        }
    }
});

var Provider = require('./shared/provider');
var Title = require('./shared/title');

module.exports = React.createClass({displayName: "exports",
    navList: function(){

        var map = this.props.record.indexTerms.geopoint ?  React.createElement("li", null, React.createElement("a", {href: "#map"}, "Map")) : null;
        var media = this.props.record.indexTerms.hasImage ? React.createElement("li", null, React.createElement("a", {href: "#media"}, "Media")) : null;

        return(
            React.createElement("ul", {id: "side-nav-list"}, 
                React.createElement("li", {className: "title"}, "Contents"), 
                React.createElement("li", null, React.createElement("a", {href: "#summary"}, "Summary")), 
                map, 
                media, 
                React.createElement("li", null, React.createElement("a", {href: "#attribution"}, "Attribution")), 
                React.createElement("li", null, React.createElement("a", {href: "#data"}, "Data"))
            )            
        )
    },
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
                    href: '/portal/search?rq={'+search.join(',')+'}', 
                    title: 'SEARCH '+title.join(', ')
                }, _.capitalize(values[index]))
            );
            if((order.length-1) > index){
                output.push(React.createElement("span", {key: 'arrow'+index}, " > "));
            }
        });

        return output;
    },
    namedTableRows: function(data, list, dic){
        var values=[];
        _.each(list, function(item){
            if(_.has(data,item)){
                var vals = _.map(_.words(data[item]),function(i){
                    return _.capitalize(i);
                }).join(' ');
                values.push(React.createElement("tr", {key: 'named-'+item, className: "name"}, React.createElement("td", null, dic[item].name), React.createElement("td", {className: "val"}, vals)));
                //values.push();
            }
        });
        return values;
    },
    render: function(){
        var data = this.props.record.data, index = this.props.record.indexTerms;//resp._source.data['idigbio:data'];
        var has = [], canonical = {};
        var record = {};

        //build canonical dictionary
        //first adding indexTerms which can contain corrected/added data not in the raw data
        _.forOwn(index,function(v,k){
            if(_.has(fields.byTerm,k) && _.has(fields.byTerm[k],'dataterm')){
                var dt = fields.byTerm[k].dataterm;
                //use data dictionary term if it is exists because its not corrected data
                //and contains the orginal text caseing.
                if(_.has(data,dt)){
                    canonical[dt] = data[dt];
                }else{
                    canonical[dt] = v;
                }   
            }
        })
        //then add raw data that isn't supplied by indexTerms
        _.defaults(canonical,data);

        _.each(dwc.order,function(val,key){
            _.each(dwc.order[key],function(fld){
                if(_.has(canonical,fld)){
                    if(_.has(record,key) === false){
                        record[key] = [];
                    } 
                    var datum = {};
                    datum[fld] = canonical[fld];
                    record[key].push(datum);
                    has.push(fld);
                }
            });
        });
        //add unidentified values to other section
        var dif = _.difference(Object.keys(canonical), has);
        _.each(dif,function(item){
            if(item.indexOf('idigbio:') === -1){
                if(_.isUndefined(record['other'])){
                    record['other'] = [];
                }     
                var datum = {};
                datum[item] = canonical[item];       
                record['other'].push(datum);
            }
        });

        var eventdate=null;
        if(index.eventdate){
            eventdate = React.createElement("tr", {className: "name"}, React.createElement("td", null, "Date Collected"), React.createElement("td", {className: "val"}, index.eventdate));
        }
        var lat = null, lon = null;
        if(index.geopoint){
            lat = React.createElement("tr", {className: "name"}, React.createElement("td", null, "Latitude"), React.createElement("td", {className: "val"}, index.geopoint.lat));
            lon = React.createElement("tr", {className: "name"}, React.createElement("td", null, "Longitude"), React.createElement("td", {className: "val"}, index.geopoint.lon));
        }
        return (
            React.createElement("div", {className: "container-fluid"}, 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {id: "content", className: "col-lg-7 col-lg-offset-2 col-md-10 col-sm-10"}, 
                        React.createElement("h1", {id: "banner"}, "Specimen Record"), 
                        React.createElement("div", {id: "summary", className: "section scrollspy"}, this.taxaBreadCrumbs()), 
                        React.createElement(Title, {data: this.props.record, attribution: this.props.record.attribution}), 
                        React.createElement("div", {id: "summary-info", className: "clearfix"}, 
                            React.createElement("div", {className: "pull-left sec"}, 
                                React.createElement("table", null, 
                                this.namedTableRows(index, ['continent','country','stateprovince','county','city','locality'], fields.byTerm), 
                                lat, 
                                lon
                                )
                            ), 
                            React.createElement("div", {className: "pull-left sec collection"}, 
                                React.createElement("table", null, 
                                this.namedTableRows(data, ['dwc:institutionCode','dwc:collectionCode','dwc:catalogNumber','dwc:recordedBy'], fields.byDataTerm), 
                                eventdate
                                )
                            )
                        ), 
                        React.createElement(Map, {data: index}), 
                        React.createElement(Gallery, {data: index}), 
                        React.createElement(Provider, {data: this.props.record.attribution}), 
                        React.createElement(Record, {record: record, raw: this.props.record})
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
