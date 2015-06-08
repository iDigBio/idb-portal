
var React = require('react')
var dwc = require('../../lib/dwc_fields');
var _ = require('lodash');
var fields = require('../../lib/fields');

var Tab = React.createClass({displayName: "Tab",
    showSection: function(event){
        event.preventDefault();
        $('li.tab').removeClass('active');
        $(event.currentTarget).addClass('active');
        $('.section').addClass('visible-print-block');
        $('#'+$(event.currentTarget).attr('data-tab')).removeClass('visible-print-block');
    },
    render: function(){
        var cl = "tab";
        if(this.props.active){
            cl="tab active";
        }
        return (
            React.createElement("li", {className: cl, "data-tab": this.props.name, onClick: this.showSection}, 
                React.createElement("a", {href: '#'+this.props.name}, 
                    dwc.names[this.props.name]
                )
            )
        );
    }
});

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
                React.createElement("td", {className: "field-name"}, name), 
                React.createElement("td", {className: "field-value", dangerouslySetInnerHTML: {__html: str}})
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
                React.createElement("table", {className: "record-table"}, 
                    rows
                )
            )
        );
    }
});

var Record = React.createClass({displayName: "Record",
    render: function(){
        var has = [];
        var sorder = ['taxonomy','specimen','collectionevent','locality','paleocontext','other'];
        var record =[],tabs=[],self=this;
        var cnt = 0;
        sorder.forEach(function(sec,index){
            if(_.has(self.props.record,sec)){
                var active=false;
                if(cnt===0){
                    active=true;
                }
                tabs.push(React.createElement(Tab, {key: 'tab-'+sec, keyid: 'tab-'+sec, name: sec, active: active}))
                record.push(React.createElement(Section, {key: 'sec-'+sec, key: 'sec-'+sec, name: sec, data: self.props.record[sec], active: active}));
                cnt++;
            } 
        })

        return (
            React.createElement("div", {id: "record-container"}, 
                React.createElement("ul", {className: "tabs hidden-print"}, 
                    tabs
                ), 
                React.createElement("div", {className: "record"}, 
                    record
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
                React.createElement("img", {className: "gallery-image", onError: this.error, src: '//api.idigbio.org/v1/mediarecords/'+this.props.keyid+'/media?quality=webview'})
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
                React.createElement("div", {id: "gallery-wrapper"}, 
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

var Buttons = React.createClass({displayName: "Buttons",
    print: function(){
        window.print()
    },
    render: function(){

        return (
            React.createElement("div", {id: "actions", className: "clearfix hidden-print"}, 
                
                React.createElement("div", {id: "action-buttons"}, 
                    React.createElement("a", {href: "/portal/recordsets/"+this.props.data.recordset}, 
                        React.createElement("button", {className: "btn"}, "Go To Recordset")
                    ), 
                    React.createElement("button", {"data-target": "#raw", "data-toggle": "modal", className: "btn"}, 
                        "View Raw Data"
                    ), 
                    React.createElement("button", {className: "btn", title: "print this page", onClick: this.print}, 
                        React.createElement("i", {className: "glyphicon glyphicon-print"}, " ")
                    )
                )
            )
        )
    }
});

var Map = React.createClass({displayName: "Map",
    render: function(){
        if(_.has(this.props.data,'geopoint')){
            return (
                React.createElement("div", {id: "map", className: "clearfix"}, 
                    React.createElement("h4", {className: "title"}, "Georeference Data"), 
                    React.createElement("div", {id: "map-wrapper"}, 
                        React.createElement("div", {id: "map-box"}), 
                        React.createElement("div", {id: "map-geopoint"}, 
                            React.createElement("span", null, "Lat: ", this.props.data.geopoint.lat), 
                            React.createElement("span", null, "Lon: ", this.props.data.geopoint.lon)
                        )
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

module.exports = Page = React.createClass({displayName: "Page",
    render: function(){
        var data = this.props.record.data, index = this.props.record.indexTerms;//resp._source.data['idigbio:data'];
        var has = [],canonical={};
        var record = {};

        //build canonical dictionary
        //first adding indexTerms which are most correct
        _.forOwn(index,function(v,k){
            if(_.has(fields.byTerm,k) && _.has(fields.byTerm[k],'dataterm')){
                var dt=fields.byTerm[k].dataterm;
                //use data dictionary term if it is exists because its not corrected data
                //and contains the orginal text caseing.
                if(_.has(data,dt)){
                    canonical[dt]=data[dt];
                }else{
                    canonical[dt]=v;
                }   
            }
        })
        //then add raw data that isn't supplied by indexTerms
        _.defaults(canonical,data);

        _.each(dwc.order,function(val,key){
            _.each(dwc.order[key],function(fld){
                if(_.has(canonical,fld)){
                    if(_.has(record,key)===false){
                        record[key]=[]
                    } 
                    var datum={};
                    datum[fld]=canonical[fld];
                    record[key].push(datum);
                    has.push(fld);
                }
            });
        });
        //add unidentified values to other section
        var dif = _.difference(Object.keys(canonical), has);
        _.each(dif,function(item){
            if(item.indexOf('idigbio:')===-1){
                if(_.isUndefined(record['other'])){
                    record['other']=[];
                }     
                var datum={};
                datum[item]=canonical[item];       
                record['other'].push(datum);
            }
        });
       
        return (
            React.createElement("div", {className: "container-fluid"}, 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-lg-12"}, 

                        React.createElement("div", {id: "data-container", className: "clearfix"}, 
                            React.createElement(Title, {data: this.props.record}), 
                            React.createElement("div", {id: "data-content"}, 
                                React.createElement(Record, {record: record})
                            ), 
                            React.createElement("div", {id: "data-meta", className: "clearfix"}, 
                                React.createElement(Buttons, {data: index}), 
                                React.createElement(Gallery, {data: index}), 
                                React.createElement(Map, {data: index})
                            ), 
                            React.createElement(Provider, {data: this.props.record.attribution})
                        )
                    )
                ), 
                React.createElement(Raw, {data: data})
            )
        )
    }

})
