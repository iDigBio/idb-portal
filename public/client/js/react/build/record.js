/**
 * @jsx React.DOM
 */

var React = require('react')
var dwc = require('../../lib/dwc_fields');
var _ = require('lodash');
var fields = require('../../lib/fields');

var Tab = React.createClass({displayName: 'Tab',
    showSection: function(event){
        event.preventDefault();
        $('li.tab').removeClass('active');
        $(event.currentTarget).addClass('active');
        $('.section').addClass('section-hide');
        $('#'+$(event.currentTarget).attr('data-tab')).removeClass('section-hide');
    },
    render: function(){
        var cl = "tab";
        if(this.props.active){
            cl="tab active";
        }
        return (
            React.DOM.li({className: cl, 'data-tab': this.props.name, onClick: this.showSection}, 
                React.DOM.a({href: '#'+this.props.name}, 
                    dwc.names[this.props.name]
                )
            )
        );
    }
});

var Row = React.createClass({displayName: 'Row',
    render: function(){
        var name = _.isUndefined(dwc.names[this.props.key]) ? this.props.key : dwc.names[this.props.key];
        var regex = /(https?:\/\/(\S|\w)+)/;
        var str = this.props.data[this.props.key].replace(regex, "<a target=\"_outlink\" href=\"$1\">$1</a>");
        return (
            React.DOM.tr({className: "data-row"}, 
                React.DOM.td({className: "field-name"}, name), 
                React.DOM.td({className: "field-value", dangerouslySetInnerHTML: {__html: str}})
            )
        );   
    }
});

var Section = React.createClass({displayName: 'Section',
    render: function(){
        var rows = [],self=this;
        var data = this.props.data;
        
        _.each(data, function(fld){
            var key = Object.keys(fld)[0];
            var name = _.isUndefined(dwc.names[key]) ? key : dwc.names[key];
            var regex = /(https?:\/\/(\S|\w)+)/;
            console.log('key is: ' +key)
            var val = fld[key];
            if(_.isString(val)){
               val = val.replace(regex, "<a target=\"_outlink\" href=\"$1\">$1</a>");
            }
            rows.push( 
                React.DOM.tr({key: key, className: "data-row"}, 
                    React.DOM.td({className: "field-name"}, name), 
                    React.DOM.td({className: "field-value", dangerouslySetInnerHTML: {__html: val}})
                )
            ); 
        });
        var cl = "section section-hide";
        if(this.props.active){
            cl="section";
        }
        return (
            React.DOM.div({id: this.props.name, className: cl}, 
                React.DOM.table({className: "record-table"}, 
                    rows
                )
            )
        );
    }
});

var Record = React.createClass({displayName: 'Record',
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
                tabs.push(Tab({key: 'tab-'+sec, name: sec, active: active}))
                record.push(Section({key: 'sec-'+sec, name: sec, data: self.props.record[sec], active: active}));
                cnt++;
            } 
        })

        return (
            React.DOM.div({id: "record-container"}, 
                React.DOM.ul({className: "tabs"}, 
                    tabs
                ), 
                React.DOM.div({className: "record"}, 
                    record
                )
            )
        );
    }
});

var Title = React.createClass({displayName: 'Title',
    render: function(){
        var title = '',info=[];
        //build title
        var data = this.props.data;
        if(_.has(data,'dwc:scientificName')) { 
            title = data['dwc:scientificName'] ;
        }else if(_.has(data, 'dwc:genus')){
            title = data['dwc:genus'];
            if(_.has(data, 'dwc:specificEpithet')){
                title += data['dwc:specificEpithet'];
            }
        }
        if(_.isEmpty(title)){
            title = 'No Name';
        } 
        //var author = '';
        if(_.has(data,'dwc:scientificNameAuthorship')){
            info.push(data['dwc:scientificNameAuthorship']);
        }
        //build info ids,inst
        ['dwc:institutionCode','dwc:collectionCode','dwc:catalogNumber'].forEach(function(item){
            if(_.has(data,item)){
                info.push(data[item]);
            }
        }) 

        return (
            React.DOM.h1({id: "title", className: "clearfix"}, 
                React.DOM.em(null, title), 
                React.DOM.span({className: "title-addition"}, 
                    info.join(', ')
                )
            )
        );       
    }
});

var Img = React.createClass({displayName: 'Img',
    error: function(event){
        $(event.currentTarget).attr('src','/portal/img/missing.svg');
    },
    render: function(){
        return (
            React.DOM.a({href: '/portal/mediarecords/'+this.props.key, title: "click to open media record"}, 
                React.DOM.img({className: "gallery-image", onError: this.error, src: '//api.idigbio.org/v1/mediarecords/'+this.props.key+'/media?quality=webview'})
            )
        );
    }
});

var Gallery = React.createClass({displayName: 'Gallery',
    render: function(){
        if(_.has(this.props.data,'mediarecords')){
            var imgs = [];
            _.each(this.props.data.mediarecords,function(item){
                imgs.push(Img({key: item}))
            })
        
            return (
                React.DOM.div({id: "gallery-wrapper"}, 
                    React.DOM.h4({className: "title"}, "Media"), 
                    React.DOM.div({id: "gallery"}, 
                        imgs
                    )
                )
            );
        }else{
            return React.DOM.span(null)
        }
    }
})

var Buttons = React.createClass({displayName: 'Buttons',
    print: function(){
        window.print()
    },
    render: function(){

        return (
            React.DOM.div({id: "actions", className: "clearfix"}, 
                
                React.DOM.div({id: "action-buttons"}, 
                    React.DOM.a({href: "/portal/recordsets/"+this.props.data.recordset}, 
                        React.DOM.button({className: "btn"}, "Go To Recordset")
                    ), 
                    React.DOM.button({'data-target': "#raw", 'data-toggle': "modal", className: "btn"}, 
                        "View Raw Data"
                    )
                )
            )
        )
    }
});


var Provider = require('./shared/provider');
var Raw = require('./shared/raw');

module.exports = Page = React.createClass({displayName: 'Page',
    render: function(){
        var data = this.props.record.data, index = this.props.record.indexTerms;//resp._source.data['idigbio:data'];
        var has = [],canonical={};
        var record = {};

        //build canonical dictionary
        //first adding indexTerms which are most correct
        _.forOwn(index,function(v,k){
            if(_.has(fields.byTerm,k) && _.has(fields.byTerm[k],'dataterm')){
                canonical[fields.byTerm[k].dataterm]=v;
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
            React.DOM.div({className: "container-fluid"}, 
                React.DOM.div({className: "row-fluid"}, 
                    React.DOM.div({className: "span12"}, 

                        React.DOM.div({id: "data-container", className: "clearfix"}, 
                            Title({data: data}), 
                            React.DOM.div({id: "data-content"}, 
                                Record({record: record})
                            ), 
                            React.DOM.div({id: "data-meta", className: "clearfix"}, 
                                Buttons({data: index}), 
                                Gallery({data: index}), 
                                React.DOM.div({id: "map", className: "clearfix"}, 
                                    React.DOM.h4({className: "title"}, "Georeference Data"), 
                                    React.DOM.div({id: "map-wrapper"}, 
                                        React.DOM.div({id: "map-box"})
                                    )
                                )
                            ), 
                            Provider({data: this.props.record.attribution})
                        )
                    )
                ), 
                Raw({data: data})
            )
        )
    }

})
