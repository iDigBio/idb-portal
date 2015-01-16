/**
 * @jsx React.DOM
 */

/*
* Recordset View page.
****/
var React = require('react')
var fields = require('../../lib/fields');
var _ = require('lodash');

//var helpers = require('./search/lib/helpers');
//var Map = require('./search/views/mapbox');
//window.queryBuilder = require('./search/lib/querybuilder');

var keys=Object.keys(fields.byDataTerm);
//add terms which aren't in data terms
//keys.push('idigbio:recordId');


var missing={};
var stotal=0,mtotal=0;
var formatNum = function(num){
    return num.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var Total = React.createClass({displayName: 'Total',
    render: function(){
        return (
            React.DOM.span(null, formatNum(this.props.total))
        )
    }
});

var Fieldrow = React.createClass({displayName: 'Fieldrow',
    checkVal: function(val){
        if(_.isNaN(val)||val==='NaN'){
            return '-';
        }else{
            return val;
        }
    },
    render: function(){
        var style = {'width': (this.props.value-2)+'px'};
        var sty2 = {'width': '170px'};
        return (
            React.DOM.tr({key: this.props.key}, 
                React.DOM.td(null, React.DOM.b(null, this.props.name), "  (", this.props.key, ")"), 
                React.DOM.td({style: sty2, className: "value-column record-count"}, this.checkVal(this.props.total)), 
                React.DOM.td({className: "value-column"}, 
                    React.DOM.div({className: "perc-box"}, 
                        React.DOM.span({className: "perc-bar", style: style}
                            
                        ), 
                        React.DOM.span({className: "perc-text"}, 
                            this.checkVal(this.props.value)
                        )
                    )
                )
            )
        );
    }
});

var FieldsTable = React.createClass({displayName: 'FieldsTable',
    render: function(){
        var self = this;
        var fieldrows = _.map(keys,function(key){
            var perc = Number(((100/self.props.stotal) * (self.props.stotal-self.props.missing[key])).toFixed(3));
            return Fieldrow({key: key, name: fields.byDataTerm[key].name, total: formatNum(self.props.stotal-self.props.missing[key]), value: perc})
        });
        var sty = {'text-align': 'center'};
        return (
            React.DOM.div({id: "fields-table"}, 
                React.DOM.h2({className: "title"}, "Specimen Fields Used for Search"), 
                React.DOM.div({className: "blurb"}, "This table represents the fields in specimen records that are used for iDigBio ", React.DOM.a({href: "/portal/search"}, "search"), ". The first column represents the field name and equivalent DWC term. The last two columns represent the number and percentage of" + ' ' + 
                 "records that provide the field."), 
                React.DOM.table({className: "table table-condensed pull-left tablesorter-blue", id: "table-fields"}, 
                    React.DOM.thead(null, 
                        React.DOM.tr(null, 
                            React.DOM.th(null, "Field"), 
                            React.DOM.th(null, "Records With This Field"), 
                            React.DOM.th({style: sty}, "(%) Percent Used")
                        )
                    ), 
                    React.DOM.tbody(null, 
                        fieldrows
                    )
                )
            )
        );
    }
});

var Title = React.createClass({displayName: 'Title',
    render: function(){
        return(
            React.DOM.h1({id: "title"}, React.DOM.span(null, "Recordset:"), " ", this.props.key)
        );
    }
});

var Description = React.createClass({displayName: 'Description',
    render: function(){
        var logo = [];
        if(_.has(this.props.data, 'logo_url') && !_.isEmpty(this.props.data.logo_url)){
            logo.push(
                React.DOM.img({className: "logo", src: this.props.data.logo_url})
            );
        }
        //decode html characters that appear in some descriptions
        var desc = _.unescape(this.props.data.collection_description);
        return(
            React.DOM.div({id: "description"}, 
                React.DOM.p(null, 
                logo, 
                React.DOM.span({dangerouslySetInnerHTML: {__html: desc}}
                )
                )
            )
        )
    }
});

var Last = React.createClass({displayName: 'Last',
    render: function(){
       return(React.DOM.span(null, this.props.key));
    }
});

var Buttons = React.createClass({displayName: 'Buttons',
    render: function(){
        var search = JSON.stringify({recordset: this.props.key})
        return(
            React.DOM.div({id: "buttons"}, 
                React.DOM.a({href: '/portal/search?rq='+search}, 
                   React.DOM.button({className: "btn button"}, "Search This Recordset")
                ), 
                React.DOM.button({'data-target': "#raw", 'data-toggle': "modal", className: "btn button"}, 
                    "View Raw Data"
                )
            )
        )
    }
});

var Contacts = React.createClass({displayName: 'Contacts',
    render: function(){
        function check(val,prefix,postfix){
             var acc = [];
            if(_.isArray(val)){
                _.each(val,function(v){
                    if(_.isString(v) && !_.isEmpty(v)) {
                        acc.push(v);
                    }
                });
                if(_.isString(prefix)){
                    val = acc.join(prefix);
                }else{
                    val = acc.join(' ');                
                }
            }else if(_.isNumber(val)){
                val = val.toString();
            }else{
                if(_.isUndefined(val) || _.isEmpty(val)){
                    val = '';
                }
            }
            if(!_.isEmpty(val) && _.isString(prefix)){
                val = prefix + val;
            }
            if(!_.isEmpty(val) && _.isString(postfix)){
                val = val + postfix;
            } 
            return val;           
        }
        function makeContact(contact){
            var name = check(contact.first_name,'',' ') + check(contact.last_name);
            var email = check(contact.email);
            var phone = check(contact.phone);
            var role = check(contact.role);
            return (
                React.DOM.ul({className: "contact"}, 
                    React.DOM.li(null, name), 
                    React.DOM.li(null, role), 
                    React.DOM.li(null, React.DOM.a({href: 'mailto: '+email}, email)), 
                    React.DOM.li(null, phone)
                )
            );            
        }
        
        var contacts = [];
        _.each(this.props.data.contacts, function(item){
            contacts.push(makeContact(item));
        });
        var link;

        if(_.has(this.props.data,'institution_web_address') && !_.isEmpty(this.props.data.institution_web_address)){
            link = (
                React.DOM.div({className: "wrapper"}, 
                    React.DOM.div({className: "info"}, "Website"), 
                    React.DOM.a({href: this.props.data.institution_web_address}, 
                        this.props.data.institution_web_address
                    )
                )
            );
        }

        return (
            React.DOM.div({id: "contacts", className: "clearfix"}, 
                React.DOM.h2({className: "title"}, "Contacts"), 
                contacts
            )
        )
    }
});

var Raw = require('./shared/raw');

module.exports = React.createClass({displayName: 'exports',
    render: function(){
        var data = this.props.recordset._source.data['idigbio:data'];
        var id = this.props.recordset._source.data['idigbio:uuid'];
        return (
            React.DOM.div({id: "container"}, 
                Title({key: data.collection_name}), 
                Description({data: data}), 
                Buttons({key: id}), 
                React.DOM.div({id: "info", className: "clearfix"}, 
                    React.DOM.div({className: "wrapper"}, 
                        React.DOM.div({className: "info"}, "Total Specimen Records:",  
                            React.DOM.span({id: "specimen-total"}, 
                                " ", Total({key: 'Specimen', total: formatNum(this.props.stotal)})
                            )
                        ), 
                        React.DOM.div({className: "info"}, "Total Media Records:", 
                            React.DOM.span({id: "media-total"}, 
                                " ", Total({key: 'Media', total: formatNum(this.props.mtotal)})
                            )
                        ), 
                        React.DOM.div({className: "info"}, "Last Update:",  
                            React.DOM.span({id: "last"}, 
                                " ", Last({key: data.update.substring(0,10)})
                            )
                        )
                    )
                ), 
                Contacts({data: data}), 
                FieldsTable({missing: this.props.missing, stotal: this.props.stotal}), 
                Raw({data: data})
            )
        )
    }
})


//get field missing counts for specimen records


//get Recordset map points
//searchServer.esQuery('records',{from:0, size:})