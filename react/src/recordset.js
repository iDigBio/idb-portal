/**
 * @jsx React.DOM
 */

/*
* Recordset View page.
****/
var React = require('react')
var fields = require('../../js/app/search/lib/fields');
var _ = require('underscore');

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

var Total = React.createClass({
    render: function(){
        return (
            <span>{formatNum(this.props.total)}</span>
        )
    }
});

var Fieldrow = React.createClass({
    checkVal: function(val){
        if(_.isNaN(val)||val==='NaN'){
            return '-';
        }else{
            return val;
        }
    },
    render: function(){
        var style = {'width': this.props.value+'px'};
        var sty2 = {'width': '170px'};
        return (
            <tr key={this.props.key}>
                <td><b>{this.props.name}</b> &nbsp;({this.props.key})</td>
                <td style={sty2} className="value-column record-count">{this.checkVal(this.props.total)}</td>
                <td className="value-column">
                    <div className="perc-box">
                        <span className="perc-bar" style={style}>
                            
                        </span>
                        <span className="perc-text">
                            {this.checkVal(this.props.value)}
                        </span>
                    </div>
                </td>
            </tr>
        );
    }
});

var FieldsTable = React.createClass({
    render: function(){
        var self = this;
        var fieldrows = _.map(keys,function(key){
            var perc = Number(((100/self.props.stotal) * (self.props.stotal-self.props.missing[key])).toFixed(3));
            return <Fieldrow key={key} name={fields.byDataTerm[key].name} total={formatNum(self.props.stotal-self.props.missing[key])} value={perc} />
        });
        var sty = {'text-align': 'center'};
        return (
            <div id="fields-table">
                <h4 className="pull-left">Specimen Fields Used for Search</h4>
                <h5 className="pull-right">Total Records: {formatNum(this.props.stotal)}</h5>
                <div className="pull-left">This table represents the fields in specimen records that are used for iDigBio <a href="/portal/search">search</a>. The first column represents the field name and equivalent DWC term. The last two columns represent the number and percentage of 
                 records that provide the field.</div>
                <table className="table  table-condensed pull-left tablesorter-blue" id="table-fields">
                    <thead>
                        <tr>
                            <th>Field</th>
                            <th>Records With This Field</th>
                            <th style={sty}>(%) Percent Used</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fieldrows}
                    </tbody>
                </table> 
            </div>
        );
    }
});

var Title = React.createClass({
    render: function(){
        return(
            <label><span className="title">Recordset:</span> {this.props.key}</label>
        );
    }
});

var Description = React.createClass({
    render: function(){
        var logo = [];
        if(_.has(this.props.data, 'logo_url') && !_.isEmpty(this.props.data.logo_url)){
            logo.push(
                <img className="logo" src={this.props.data.logo_url}/>
            );
        }
        //decode html characters that appear in some descriptions
        var desc = _.unescape(this.props.data.collection_description);
        return(
            <p className="description">
                {logo}
                <span dangerouslySetInnerHTML={{__html: desc}}>
                </span>
            </p>
        )
    }
});

var Last = React.createClass({
    render: function(){
       return(<span>{this.props.key}</span>);
    }
});

var Buttons = React.createClass({
    render: function(){
        return(
            <div className="wrapper buttons">
                <a href={'/portal/search?recordset='+this.props.key} className="btn button">Search This Recordset</a>
                <a href="#raw" data-toggle="modal" className="btn button">View Raw Data</a>
            </div>
        )
    }
});

var Contacts = React.createClass({
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
                <ul className="pull-left contact">
                    <li>{name}</li>
                    <li>{role}</li>
                    <li><a href={'mailto: '+email}>{email}</a></li>
                    <li>{phone}</li>
                </ul>
            );            
        }
        
        var contacts = [];
        _.each(this.props.data.contacts, function(item){
            contacts.push(makeContact(item));
        });
        var link;

        if(_.has(this.props.data,'institution_web_address') && !_.isEmpty(this.props.data.institution_web_address)){
            link = (
                <div className="wrapper">
                    <div className="info">Website</div>
                    <a href={this.props.data.institution_web_address}>
                        {this.props.data.institution_web_address}
                    </a>
                </div>
            );
        }

        return (
            <div>
                {link}
                <div className="wrapper">
                    <div className="info">Contacts</div>
                    {contacts}
                </div>
            </div>
        )
    }
});

var Raw = require('./shared/raw');

module.exports = React.createClass({
    render: function(){
        var data = this.props.recordset._source.data['idigbio:data'];
        return (
            <div id="container">
                <div id="title">
                    <Title key={data.collection_name} />
                </div>
                <div id="content" className="clearfix">
                    <div id="left"className="wrapper">
                        <div id="description" className="clearfix">
                            <Description data={data} />
                        </div>
                        <div id="fields" className="clearfix">
                            <FieldsTable missing={this.props.missing} stotal={this.props.stotal} />
                        </div> 
                    </div>
                    <div id="right" className="wrapper">
                        <div id="info" className="clearfix">
                            <div className="wrapper">
                                <div className="info">Last Update: 
                                    <span id="last">
                                        &nbsp;<Last key={data.update.substring(0,10)} />
                                    </span>
                                </div>
                                <div className="info">Total Specimen Records: 
                                    <span id="specimen-total">
                                        &nbsp;<Total key={'Specimen'} total={formatNum(this.props.stotal)} />
                                    </span>
                                </div>
                                <div className="info">Total Media Records:
                                    <span id="media-total">
                                        &nbsp;<Total key={'Media'} total={formatNum(this.props.mtotal)} />
                                    </span>
                                </div>
                            </div>
                            <div id="buttons" className="wrapper">
                                <Buttons key={data['idigbio:uuid']} />
                            </div>
                        </div>
                        <div id="contacts" className="clearfix">
                            <Contacts data={data} />
                        </div>
                    </div>
                </div>
                <Raw data={data} />
            </div>
        )
    }
})


//get field missing counts for specimen records


//get Recordset map points
//searchServer.esQuery('records',{from:0, size:})