
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
        var style = {'width': (this.props.value-2)+'px'};
        var sty2 = {'width': '170px'};
        return (
            <tr>
                <td><b>{this.props.name}</b></td>
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
        var flagrows = _.map(Object.keys(this.props.flags),function(flag){
            var perc = Number(((100/self.props.stotal) * self.props.flags[flag].itemCount).toFixed(3));
            return <Fieldrow key={flag} name={flag} total={self.props.flags[flag].itemCount} value={perc}/>
        })
        var sty = {'textAlign': 'center'};
        return (
            <div id="fields-table" style={{display: (this.props.active ? 'block':'none')}} className="clearfix" >
                <h4>Data Correction Statistics</h4>
                <div className="blurb">This table shows any data corrections that were performed on this recordset to improve the capabilities of iDigBio <a href="/portal/search">Search</a>. The first column represents the correction performed. The last two columns represent the number and percentage of 
                 records that were corrected.</div>
                <table className="table table-condensed pull-left tablesorter-blue" id="table-fields">
                    <thead>
                        <tr>
                            <th>Flag</th>
                            <th>Records With This Flag</th>
                            <th style={sty}>(%) Percent With This Flag</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flagrows}
                    </tbody>
                </table> 
            </div>
        );
    }
});

var UseTable = React.createClass({
    render: function(){
        var rows=[], uuid=this.props.uuid;
        _.each(this.props.use.dates,function(val,key){
            var r = val[uuid];
           
            var date=key.substring(5,7)+' / '+key.substring(0,4);

            rows.push(
                <tr key={key}>
                    <td>{date}</td>
                    <td className="value">{formatNum(r.search)}</td>
                    <td className="value">{formatNum(r.download)}</td>
                    <td className="value">{formatNum(r.seen)}</td>
                    <td className="value">{formatNum(r.viewed_records)}</td>
                    <td className="value">{formatNum(r.viewed_media)}</td>
                </tr>
            )
        })

        return (
            <div id="use-table" style={{display: (this.props.active ? 'block':'none')}} className="stat-table clearfix">
                <h4>Data Use Statistics</h4>
                <div className="clearfix">
                    The table below represents monthly iDigBio portal use statistics for this recordset. <em><b>Search</b></em> indicates in how many instances a record from this recordset matched a search query. <em><b>Download</b></em> indicates in how many instances a record from this recordset was downloaded. <em><b>Seen</b></em> indicates in how many instances a record from this recordset appeared (visually) in the search results in a browser window. 
                     &nbsp;<em><b>Records Viewed</b></em> and <em><b>Media Viewed</b></em> indicate how many specimen and media records were opened and viewed in full detail.   
                    Note: Monthly statistics aggregation began on Jan 15th 2015; therefore, the month of (01 / 2015) represents approximately half a month of statistics reporting.
                </div>
                <table className="table table-condensed pull-left tablesorter-blue" id="table-use">
                    <thead><tr><th>Month of</th><th>Search</th><th>Download</th><th>Seen</th><th>Records Viewed</th><th>Media Viewed</th></tr></thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        )
    }
});

var StatsTables = React.createClass({
    click: function(e){
        e.preventDefault();
        this.setState({active: e.currentTarget.attributes['data-active'].value})
    },
    getInitialState: function(){
        return {active: 'flags' };
    },
    render: function(){
        return (
            <div id="stats-tables" className="clearfix">
                <ul id="stats-tabs">
                    <li className={this.state.active == 'flags' ?  'active': ''} id="corrected-tab" onClick={this.click} data-active="flags">Data Corrected</li>
                    <li className={this.state.active == 'use' ?  'active': ''} id="use-tab" onClick={this.click} data-active="use">Data Use</li>
                </ul>
                <FieldsTable active={this.state.active=='flags'} flags={this.props.flags} stotal={this.props.stotal}/>
                <UseTable active={this.state.active=='use'} use={this.props.use} uuid={this.props.uuid}/>
            </div>
        )
    }
})
var Title = React.createClass({
    render: function(){
        return(
            <h1 id="title"><span>Recordset:</span> {this.props.keyid}</h1>
        );
    }
});

var Description = React.createClass({
    render: function(){
        var logo = '';
        if(_.has(this.props.data, 'logo_url') && !_.isEmpty(this.props.data.logo_url)){
            logo = <img className="logo" src={this.props.data.logo_url}/>;
        }
        //decode html characters that appear in some descriptions
        var desc = _.unescape(this.props.data.collection_description);
        return(
            <div id="description">
                <p className="clearfix">
                {logo}
                <span>
                    {desc}
                </span>
                </p>
            </div>
        )
    }
});

var Last = React.createClass({
    render: function(){
       return(<span>{this.props.keyid}</span>);
    }
});

var Buttons = React.createClass({
    render: function(){
        var search = JSON.stringify({recordset: this.props.keyid})
        return(
            <div id="buttons">
                <a href={'/portal/search?rq='+search}>
                   <button className="btn button">Search This Recordset</button>
                </a>
                <button data-target="#raw" data-toggle="modal" className="btn button">
                    View Raw Data
                </button>
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
        function makeContact(contact,ind){
            var name = check(contact.first_name,'',' ') + check(contact.last_name);
            var email = check(contact.email);
            var phone = check(contact.phone);
            var role = check(contact.role);
            return (
                <ul className="contact" key={"contact-"+ind}>
                    <li>{name}</li>
                    <li>{role}</li>
                    <li><a href={'mailto: '+email}>{email}</a></li>
                    <li>{phone}</li>
                </ul>
            );            
        }
        
        var contacts = [];
        _.each(this.props.data.contacts, function(item,ind){
            contacts.push(makeContact(item,ind));
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
            <div id="contacts" className="clearfix">
                <h2 className="title">Contacts</h2>
                {contacts}
            </div>
        )
    }
});

var Raw = require('./shared/raw');

module.exports = React.createClass({
    render: function(){
        var raw = this.props.recordset;
        var data = raw.data;
        var id = raw.uuid;
        var last = data.update.substring(0,10);
        return (
            <div id="container">
                <Title key={data.collection_name} keyid={data.collection_name} />
                <Description data={data} />
                <Buttons key={id} keyid={id} />
                <div id="info" className="clearfix">
                    <div className="wrapper">
                        <div className="info">Total Specimen Records: 
                            <span id="specimen-total">
                                &nbsp;<Total key={'Specimen'} keyid={'Specimen'} total={formatNum(this.props.stotal)} />
                            </span>
                        </div>
                        <div className="info">Total Media Records:
                            <span id="media-total">
                                &nbsp;<Total key={'Media'} keyid={'Media'} total={formatNum(this.props.mtotal)} />
                            </span>
                        </div>
                        <div className="info">Last Update: 
                            <span id="last">
                                &nbsp;<Last key={last} keyid={last} />
                            </span>
                        </div>
                    </div>
                </div>
                <Contacts data={data} />
                <StatsTables uuid={raw.uuid} use={this.props.use} flags={this.props.flags} stotal={this.props.stotal}/>
               
                <Raw data={raw} />
            </div>
        )
    }
})


//get field missing counts for specimen records


//get Recordset map points
//searchServer.esQuery('records',{from:0, size:})