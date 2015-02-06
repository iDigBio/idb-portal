
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

var Total = React.createClass({displayName: "Total",
    render: function(){
        return (
            React.createElement("span", null, formatNum(this.props.total))
        )
    }
});

var Fieldrow = React.createClass({displayName: "Fieldrow",
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
            React.createElement("tr", {key: this.props.keyid}, 
                React.createElement("td", null, React.createElement("b", null, this.props.name), "  (", this.props.keyid, ")"), 
                React.createElement("td", {style: sty2, className: "value-column record-count"}, this.checkVal(this.props.total)), 
                React.createElement("td", {className: "value-column"}, 
                    React.createElement("div", {className: "perc-box"}, 
                        React.createElement("span", {className: "perc-bar", style: style}
                            
                        ), 
                        React.createElement("span", {className: "perc-text"}, 
                            this.checkVal(this.props.value)
                        )
                    )
                )
            )
        );
    }
});

var FieldsTable = React.createClass({displayName: "FieldsTable",
    render: function(){
        var self = this;
        var fieldrows = _.map(keys,function(key){
            var perc = Number(((100/self.props.stotal) * (self.props.stotal-self.props.missing[key])).toFixed(3));
            return React.createElement(Fieldrow, {key: key, keyid: key, name: fields.byDataTerm[key].name, total: formatNum(self.props.stotal-self.props.missing[key]), value: perc})
        });
        var sty = {'text-align': 'center'};
        return (
            React.createElement("div", {id: "fields-table"}, 
                React.createElement("h2", {className: "title"}, "Specimen Fields Used for Search"), 
                React.createElement("div", {className: "blurb"}, "This table represents the fields in specimen records that are used for iDigBio ", React.createElement("a", {href: "/portal/search"}, "search"), ". The first column represents the field name and equivalent DWC term. The last two columns represent the number and percentage of" + ' ' + 
                 "records that provide the field."), 
                React.createElement("table", {className: "table table-condensed pull-left tablesorter-blue", id: "table-fields"}, 
                    React.createElement("thead", null, 
                        React.createElement("tr", null, 
                            React.createElement("th", null, "Field"), 
                            React.createElement("th", null, "Records With This Field"), 
                            React.createElement("th", {style: sty}, "(%) Percent Used")
                        )
                    ), 
                    React.createElement("tbody", null, 
                        fieldrows
                    )
                )
            )
        );
    }
});

var Title = React.createClass({displayName: "Title",
    render: function(){
        return(
            React.createElement("h1", {id: "title"}, React.createElement("span", null, "Recordset:"), " ", this.props.keyid)
        );
    }
});

var Description = React.createClass({displayName: "Description",
    render: function(){
        var logo = [];
        if(_.has(this.props.data, 'logo_url') && !_.isEmpty(this.props.data.logo_url)){
            logo.push(
                React.createElement("img", {className: "logo", src: this.props.data.logo_url})
            );
        }
        //decode html characters that appear in some descriptions
        var desc = _.unescape(this.props.data.collection_description);
        return(
            React.createElement("div", {id: "description"}, 
                React.createElement("p", null, 
                logo, 
                React.createElement("span", {dangerouslySetInnerHTML: {__html: desc}}
                )
                )
            )
        )
    }
});

var Last = React.createClass({displayName: "Last",
    render: function(){
       return(React.createElement("span", null, this.props.keyid));
    }
});

var Buttons = React.createClass({displayName: "Buttons",
    render: function(){
        var search = JSON.stringify({recordset: this.props.keyid})
        return(
            React.createElement("div", {id: "buttons"}, 
                React.createElement("a", {href: '/portal/search?rq='+search}, 
                   React.createElement("button", {className: "btn button"}, "Search This Recordset")
                ), 
                React.createElement("button", {"data-target": "#raw", "data-toggle": "modal", className: "btn button"}, 
                    "View Raw Data"
                )
            )
        )
    }
});

var Contacts = React.createClass({displayName: "Contacts",
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
                React.createElement("ul", {className: "contact"}, 
                    React.createElement("li", null, name), 
                    React.createElement("li", null, role), 
                    React.createElement("li", null, React.createElement("a", {href: 'mailto: '+email}, email)), 
                    React.createElement("li", null, phone)
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
                React.createElement("div", {className: "wrapper"}, 
                    React.createElement("div", {className: "info"}, "Website"), 
                    React.createElement("a", {href: this.props.data.institution_web_address}, 
                        this.props.data.institution_web_address
                    )
                )
            );
        }

        return (
            React.createElement("div", {id: "contacts", className: "clearfix"}, 
                React.createElement("h2", {className: "title"}, "Contacts"), 
                contacts
            )
        )
    }
});

var Raw = require('./shared/raw');

module.exports = React.createClass({displayName: "exports",
    render: function(){
        var data = this.props.recordset._source.data['idigbio:data'];
        var id = this.props.recordset._source.data['idigbio:uuid'];
        var last = data.update.substring(0,10);
        return (
            React.createElement("div", {id: "container"}, 
                React.createElement(Title, {key: data.collection_name, keyid: data.collection_name}), 
                React.createElement(Description, {data: data}), 
                React.createElement(Buttons, {key: id, keyid: id}), 
                React.createElement("div", {id: "info", className: "clearfix"}, 
                    React.createElement("div", {className: "wrapper"}, 
                        React.createElement("div", {className: "info"}, "Total Specimen Records:",  
                            React.createElement("span", {id: "specimen-total"}, 
                                " ", React.createElement(Total, {key: 'Specimen', keyid: 'Specimen', total: formatNum(this.props.stotal)})
                            )
                        ), 
                        React.createElement("div", {className: "info"}, "Total Media Records:", 
                            React.createElement("span", {id: "media-total"}, 
                                " ", React.createElement(Total, {key: 'Media', keyid: 'Media', total: formatNum(this.props.mtotal)})
                            )
                        ), 
                        React.createElement("div", {className: "info"}, "Last Update:",  
                            React.createElement("span", {id: "last"}, 
                                " ", React.createElement(Last, {key: last, keyid: last})
                            )
                        )
                    )
                ), 
                React.createElement(Contacts, {data: data}), 
                React.createElement(FieldsTable, {missing: this.props.missing, stotal: this.props.stotal}), 
                React.createElement(Raw, {data: data})
            )
        )
    }
})


//get field missing counts for specimen records


//get Recordset map points
//searchServer.esQuery('records',{from:0, size:})