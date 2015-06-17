
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
            React.createElement("tr", null, 
                React.createElement("td", null, React.createElement("b", null, this.props.name)), 
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
        var flagrows = _.map(Object.keys(this.props.flags),function(flag){
            var perc = Number(((100/self.props.stotal) * self.props.flags[flag].itemCount).toFixed(3));
            return React.createElement(Fieldrow, {key: flag, name: flag, total: self.props.flags[flag].itemCount, value: perc})
        })
        var sty = {'textAlign': 'center'};
        return (
            React.createElement("div", {id: "fields-table", style: {display: (this.props.active ? 'block':'none')}, className: "clearfix"}, 
               
                React.createElement("div", {className: "blurb"}, "This table shows any data corrections that were performed on this recordset to improve the capabilities of iDigBio ", React.createElement("a", {href: "/portal/search"}, "Search"), ". The first column represents the correction performed. The last two columns represent the number and percentage of" + ' ' + 
                 "records that were corrected."), 
                React.createElement("table", {className: "table table-condensed pull-left tablesorter-blue", id: "table-fields"}, 
                    React.createElement("thead", null, 
                        React.createElement("tr", null, 
                            React.createElement("th", null, "Flag"), 
                            React.createElement("th", null, "Records With This Flag"), 
                            React.createElement("th", {style: sty}, "(%) Percent With This Flag")
                        )
                    ), 
                    React.createElement("tbody", null, 
                        flagrows
                    )
                )
            )
        );
    }
});

var UseTable = React.createClass({displayName: "UseTable",
    render: function(){
        var rows=[], uuid=this.props.uuid;
        _.each(this.props.use.dates,function(val,key){
            var r = val[uuid];
           
            var date=key.substring(5,7)+' / '+key.substring(0,4);

            rows.push(
                React.createElement("tr", {key: key}, 
                    React.createElement("td", null, date), 
                    React.createElement("td", {className: "value"}, formatNum(r.search)), 
                    React.createElement("td", {className: "value"}, formatNum(r.download)), 
                    React.createElement("td", {className: "value"}, formatNum(r.seen)), 
                    React.createElement("td", {className: "value"}, formatNum(r.viewed_records)), 
                    React.createElement("td", {className: "value"}, formatNum(r.viewed_media))
                )
            )
        })

        return (
            React.createElement("div", {id: "use-table", style: {display: (this.props.active ? 'block':'none')}, className: "stat-table clearfix"}, 
               
                React.createElement("div", {className: "clearfix"}, 
                    "The table below represents monthly iDigBio portal use statistics for this recordset. ", React.createElement("em", null, React.createElement("b", null, "Search")), " indicates in how many instances a record from this recordset matched a search query. ", React.createElement("em", null, React.createElement("b", null, "Download")), " indicates in how many instances a record from this recordset was downloaded. ", React.createElement("em", null, React.createElement("b", null, "Seen")), " indicates in how many instances a record from this recordset appeared (visually) in the search results in a browser window." + ' ' + 
                     " ", React.createElement("em", null, React.createElement("b", null, "Records Viewed")), " and ", React.createElement("em", null, React.createElement("b", null, "Media Viewed")), " indicate how many specimen and media records were opened and viewed in full detail." + ' ' +   
                    "Note: Monthly statistics aggregation began on Jan 15th 2015; therefore, the month of (01 / 2015) represents approximately half a month of statistics reporting."
                ), 
                React.createElement("table", {className: "table table-condensed pull-left tablesorter-blue", id: "table-use"}, 
                    React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Month of"), React.createElement("th", null, "Search"), React.createElement("th", null, "Download"), React.createElement("th", null, "Seen"), React.createElement("th", null, "Records Viewed"), React.createElement("th", null, "Media Viewed"))), 
                    React.createElement("tbody", null, 
                        rows
                    )
                )
            )
        )
    }
});

var StatsTables = React.createClass({displayName: "StatsTables",
    click: function(e){
        e.preventDefault();
        this.setState({active: e.currentTarget.attributes['data-active'].value})
    },
    getInitialState: function(){
        return {active: 'flags' };
    },
    render: function(){
        return (
            React.createElement("div", {id: "stats-tables", className: "clearfix"}, 
                React.createElement("ul", {id: "stats-tabs"}, 
                    React.createElement("li", {className: this.state.active == 'flags' ?  'active': '', id: "corrected-tab", onClick: this.click, "data-active": "flags"}, "Data Corrected"), 
                    React.createElement("li", {className: this.state.active == 'use' ?  'active': '', id: "use-tab", onClick: this.click, "data-active": "use"}, "Data Use")
                ), 
                React.createElement(FieldsTable, {active: this.state.active=='flags', flags: this.props.flags, stotal: this.props.stotal}), 
                React.createElement(UseTable, {active: this.state.active=='use', use: this.props.use, uuid: this.props.uuid})
            )
        )
    }
})
var Title = React.createClass({displayName: "Title",
    render: function(){
        return(
            React.createElement("h1", {id: "title"}, React.createElement("span", null, "Recordset:"), " ", this.props.keyid)
        );
    }
});

var Description = React.createClass({displayName: "Description",
    render: function(){
        var logo = '';
        if(_.has(this.props.data, 'logo_url') && !_.isEmpty(this.props.data.logo_url)){
            logo = React.createElement("img", {className: "logo", src: this.props.data.logo_url});
        }
        //decode html characters that appear in some descriptions
        var desc = _.unescape(this.props.data.collection_description);
        return(
            React.createElement("div", {id: "description"}, 
                React.createElement("p", {className: "clearfix"}, 
                logo, 
                React.createElement("span", null, 
                    desc
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
        function makeContact(contact,ind){
            var name = check(contact.first_name,'',' ') + check(contact.last_name);
            var email = check(contact.email);
            var phone = check(contact.phone);
            var role = check(contact.role);
            return (
                React.createElement("ul", {className: "contact", key: "contact-"+ind}, 
                    React.createElement("li", null, name), 
                    React.createElement("li", null, role), 
                    React.createElement("li", null, React.createElement("a", {href: 'mailto: '+email}, email)), 
                    React.createElement("li", null, phone)
                )
            );            
        }
        
        var contacts = [];
        _.each(this.props.data.contacts, function(item,ind){
            contacts.push(makeContact(item,ind));
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
        var raw = this.props.recordset;
        var data = raw.data;
        var id = raw.uuid;
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
                React.createElement(StatsTables, {uuid: raw.uuid, use: this.props.use, flags: this.props.flags, stotal: this.props.stotal}), 
               
                React.createElement(Raw, {data: raw})
            )
        )
    }
})


//get field missing counts for specimen records


//get Recordset map points
//searchServer.esQuery('records',{from:0, size:})