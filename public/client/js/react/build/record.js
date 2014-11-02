/**
 * @jsx React.DOM
 */

var React = require('react')
var dwc = require('./lib/dwc_fields');
var _ = require('lodash');

var Tab = React.createClass({displayName: 'Tab',
    showSection: function(event){
        event.preventDefault();
        $('li.tab').removeClass('active');
        $(event.currentTarget).addClass('active');
        $('.section').addClass('section-hide');
        $('#'+$(event.currentTarget).attr('data-tab')).removeClass('section-hide');
    },
    render: function(){
        return (
            React.DOM.li({className: "tab", 'data-tab': this.props.key, onClick: this.showSection}, 
                React.DOM.a({href: '#'+this.props.key}, 
                    dwc.names[this.props.key]
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
        var rows = [];
        var data = this.props.data._source.data['idigbio:data'];
        
        _.each(this.props.fields,function(fld){
            if(_.isString(data[fld])){
                rows.push(Row({key: fld, data: data}));
            } 
        });
        
        return (
            React.DOM.div({id: this.props.key, className: "section section-hide"}, 
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
        var sorder = ['taxonomy','specimen','collectionevent','locality','other'];
        var record =[],tabs=[],self=this;
        _.each(this.props.record,function(val,key){
            record.push(Section({fields: val, key: key, data: self.props.data}));
        });

        var reckeys = Object.keys(this.props.record);
        _.each(sorder,function(sec){
            if(reckeys.indexOf(sec)!==-1){
                tabs.push(Tab({key: sec}))
            }
        });

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
        var author = '';
        if(_.has(data,'dwc:scientificNameAuthorship')){
            author = ', '+data['dwc:scientificNameAuthorship'];
        }
        //build info ids,inst
        ['dwc:institutionCode','dwc:collectionCode','dwc:catalogNumber'].forEach(function(item){
            if(_.has(data,item)){
                info.push(data[item]);
            }
        }) 

        return (
            React.DOM.div(null, 
                React.DOM.em(null, title), 
                author, " ", 
                info.join(', ')
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
                    React.DOM.div({id: "images", className: "clearfix"}, 
                        React.DOM.h4({className: "title"}, "Associated Media"), 
                        React.DOM.div({id: "gallery"}, 
                            imgs
                        )
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
            React.DOM.div({id: "action-buttons"}, 
                React.DOM.a({className: "btn btn-material-indigo", href: "/portal/recordsets/"+this.props.data.recordset}, 
                    "Go To Recordset"
                ), 
                React.DOM.a({href: "#raw", 'data-toggle': "modal", className: "btn btn-material-lightblue"}, 
                    "View Raw Data"
                )
            )
        )
    }
});


var Provider = require('./shared/provider');
var Raw = require('./shared/raw');

module.exports = Page = React.createClass({displayName: 'Page',
    render: function(){
        var data = this.props.record._source.data['idigbio:data'];//resp._source.data['idigbio:data'];
        var has = [];
        var record = {};
        _.each(dwc.order,function(val,key){
            _.each(dwc.order[key],function(fld){
                if(_.has(data,fld)){
                    if(_.has(record,key)===false){
                        record[key]=[]
                    } 
                    record[key].push(fld);
                    has.push(fld);
                }
            });
        });
        //add unidentified values to other section
        var dif = _.difference(Object.keys(data), has);
        _.each(dif,function(item){
            if(item.indexOf('idigbio:')===-1){
                if(_.isUndefined(record['other'])){
                    record['other']=[];
                }            
                record['other'].push(item);
            }
        });
        return (
            React.DOM.div({className: "container-fluid"}, 
                React.DOM.div({className: "row-fluid"}, 
                    React.DOM.div({className: "span12"}, 
                        React.DOM.h1({id: "title", className: "clearfix"}, 
                            Title({data: this.props.record._source.data['idigbio:data']})
                        ), 
                        React.DOM.div({id: "data-container", className: "clearfix"}, 
                            React.DOM.div({id: "data-content"}, 
                                Record({record: record, data: this.props.record})
                            ), 
                            React.DOM.div({id: "data-meta"}, 
                                React.DOM.div({id: "actions"}, 
                                    Buttons({data: this.props.record._source})
                                ), 
                                
                                Gallery({data: this.props.record._source}), 
                                    
                                React.DOM.div({id: "map", className: "clearfix"}, 
                                    React.DOM.h4({className: "title"}, "Specimen Georeference"), 
                                    React.DOM.div({id: "map-box"})
                                )
                            ), 
                            React.DOM.div({id: "collection", className: "clearfix"}, 
                                Provider({data: this.props.provider})
                            )
                        )
                    )
                ), 
                Raw({data: this.props.record._source.data['idigbio:data']})
            )
        )
    }

})
