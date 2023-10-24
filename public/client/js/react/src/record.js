import React from 'react';
import Provider from './shared/provider';
import Title from './shared/title';
import dwc from '../../lib/dwc_fields';
import _ from 'lodash';
import moment from 'moment';
import fields from '../../lib/fields';
import dqFlags from '../../lib/dq_flags';
import idbapi from '../../lib/idbapi';



class Row extends React.Component{
    render(){
        var name = _.isUndefined(dwc.names[this.props.keyid]) ? this.props.keyid : dwc.names[this.props.keyid];
        var regex = /[\A|\s]*(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=;]+)/g;
        var str = this.props.data.replace(regex, function(match){
            var href = match.replace(/(;|=|\+|!|&|,|\(|\)|\*|'|#)$/, '');
            return "<a target=\"_outlink\" href=\""+href+"\">"+match+"</a>";

        });
        return (
            <tr className="data-rows">
                <td className="field-name" style={{width:'50%'}}>{name}</td>
                <td className="field-value" style={{width:'50%'}} dangerouslySetInnerHTML={{__html: str}}></td>
            </tr>
        );
    }
};

class Section extends React.Component{
    constructor(props) {
        super(props)
    }
    render(){
        var rows = [],self=this;
        var data = this.props.data;

        _.each(data,function(fld){
            var key = Object.keys(fld)[0];
            if(_.isString(fld[key])){
                rows.push(<Row key={key} keyid={key} data={fld[key]}/>);
            }
        });
        var cl = "section visible-print-block";
        if(this.props.active){
            cl="section";
        }
        return (
            <div id={this.props.name} className={cl} >
                <h5>{dwc.names[this.props.name]}</h5>
                <table className="table table-striped table-condensed table-bordered">
                    <tbody>{rows}</tbody>
                </table>
            </div>
        );
    }
};

class Flags extends React.Component{
    render(){
        var rows = _.map(this.props.flags, function(flag){
            return (
                <tr key={'flag-'+flag}><td>{flag}</td><td>{dqFlags[flag]}</td></tr>
            )
        })

        return (
            <div id="flags" style={{display: (this.props.active ? 'block' : 'none' )}}>
                <table className="table table-striped table-bordered table-condensed">
                    <thead>
                        <tr><th>Type</th><th>Description</th></tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        )
    }
};

class Record extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            active: "record"
        }
        this.formatJSON = this.formatJSON.bind(this)
        this.tabClick = this.tabClick.bind(this)
    }
    formatJSON(json){
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
    }
    // getInitialState(){
    //     return {active: "record"};
    // }
    tabClick(e){
        e.preventDefault();
        this.setState({active: e.target.attributes['data-tab'].value});
    }
    render(){
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
                record.push(<Section key={'sec-'+sec} name={sec} data={self.props.record[sec]} active={active} />);
                cnt++;
            }
        });

        if(this.props.raw.indexTerms.flags){
            flags = <Flags flags={this.props.raw.indexTerms.flags} active={this.state.active == 'flags'} />;
            flagsTab = <li className={this.state.active == 'flags' ? 'active' : ''} data-tab="flags">Flags</li>;
        }

        return (
            <div id="data" className="scrollspy section">

                <ul className="tabs" onClick={this.tabClick}>
                    <li className={this.state.active == 'record' ? 'active' : ''} data-tab="record">Data</li>
                    {flagsTab}
                    <li className={this.state.active == 'raw' ? 'active' : ''} data-tab="raw">Raw</li>
                </ul>
                <div id="record" className="clearfix" style={{display: (this.state.active == 'record' ? 'block' : 'none' )}}>
                    {record}
                </div>
                {flags}
                <div id="raw" style={{display: (this.state.active == 'raw' ? 'block' : 'none' )}}>
                    <p id="raw-body" dangerouslySetInnerHTML={{__html: this.formatJSON(this.props.raw)}}>
                    </p>
                </div>
            </div>
        );
    }
};

class Img extends React.Component{
    error(event){
        $(event.currentTarget).attr('src','/portal/img/missing.svg');
    }
    render(){
        return (
            <a href={'/portal/mediarecords/'+this.props.keyid} title="click to open media record">
                <img className="gallery-image" onError={this.error} src={idbapi.media_host + 'v2/media/'+this.props.keyid+'?size=webview'} />
            </a>
        );
    }
};

 class Gallery extends React.Component{
    render(){
        if(_.has(this.props.data,'mediarecords')){

            var imgs = [];

            _.each(this.props.data.mediarecords,function(item){
                imgs.push(<Img key={item} keyid={item} />);
            })

            return (
                <div id="media" className="scrollspy section">
                    <h4 className="title">Media</h4>
                    <div id="gallery">
                        {imgs}
                    </div>
                </div>
            );
        }else{
            return <span/>
        }
    }
};

class Map extends React.Component{
    render(){
        if(_.has(this.props.data,'geopoint')){
            return (
                <div id="map" className="clearfix scrollspy section">

                    <div id="map-wrapper">
                        <div id="map-box"></div>
                    </div>
                </div>
            )
        }else{
            return <span/>
        }
    }
};


class SuppliedCitation extends React.Component{
    render(){
        if(_.has(this.props.data,'dcterms:bibliographicCitation')){
            return (
                <div id="citation" className="clearfix scrollspy section">
                    <div>The provider has specified the following citation for use with this data.</div>
                    <div id="citationText" className="citationtext">{this.props.data['dcterms:bibliographicCitation']}</div>
                </div>
            )
        }else{
            return(null);
        }
    }
};

class Citation extends React.Component{

    render(){
        return(
            <div id="citation" className="clearfix scrollspy section">
                <h2 className="title">Citation</h2>
                <SuppliedCitation data={this.props.data.data} />
                <div>This is the constructed <a href="https://www.idigbio.org/content/citation-guidelines">iDigBio Citation Format</a> using information supplied by the data provider.</div>
                <div id="citationText" className="citationtext">
                    {_.has(this.props.data.data, 'dwc:occurrenceID') && this.props.data.data['dwc:occurrenceID'] + '. '}
                    {_.has(this.props.data.data, 'dwc:catalogNumber') && this.props.data.data['dwc:catalogNumber'] + '. '}
                    {_.has(this.props.data.attribution, 'name') && this.props.data.attribution['name'] + '. '}
                    <a href={"https://search.idigbio.org/v2/search/publishers?pq={%22uuid%22:%22"+this.props.data.attribution['publisher']+"%22}"}>{this.props.pubname}</a>.
                    <a href={"/portal/recordsets/"+this.props.data.attribution.uuid}> http://portal.idigbio.org/portal/recordsets/{this.props.data.attribution.uuid}</a>.
                    Accessed on {moment().format("LL")}.
                </div>
            </div>
        )
    }
};

class RecordPage extends React.Component{
    constructor(props) {
        super(props);
        this.navList = this.navList.bind(this)
        this.taxaBreadCrumbs = this.taxaBreadCrumbs.bind(this)
        this.namedTableRows = this.namedTableRows.bind(this)

    }

    navList(){

        var map = this.props.record.indexTerms.geopoint ?  <li><a href="#map">Map</a></li> : null;
        var media = this.props.record.indexTerms.hasImage ? <li><a href="#media">Media</a></li> : null;

        return(
            <ul id="side-nav-list">
                <li className="title">Contents</li>
                <li><a href="#summary">Summary</a></li>
                {map}
                {media}
                <li><a href="#attribution">Attribution</a></li>
                <li><a href="#citation">Citation</a></li>
                <li><a href="#data">All Data</a></li>
            </ul>
        )
    }
    taxaBreadCrumbs(){
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
                <a
                    key={'bread-'+item}
                    href={'/portal/search?rq={'+search.join(',')+'}'}
                    title={'SEARCH '+title.join(', ')}
                >{_.capitalize(values[index])}</a>
            );
            if((order.length-1) > index){
                output.push(<span key={'arrow'+index}>&nbsp;{'>'}&nbsp;</span>);
            }
        });

        return output;
    }
    namedTableRows(data, list, dic){
        var values=[];
        _.each(list, function(item){
            if(_.has(data,item)){
                var vals = _.map(_.words(data[item], /[^ ]+/g),function(i){
                    return _.capitalize(i);
                }).join(' ');
                values.push(<tr key={'named-'+item} className="name"><td>{dic[item].name}</td><td className="val">{vals}</td></tr>);
                //values.push();
            }
        });
        return values;
    }
    render(){
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
        if(index.datecollected){
            var d = new Date(index.datecollected)
            // Most of the stored dates don't have a Time Zone, so are treated as UTC. Increment the time by the timezone offset, otherwise most displayed values would be displayed as one day early
            d.setTime(d.getTime() + d.getTimezoneOffset() * 60000)
            var formatedDC = d.getFullYear() + '-' + ((d.getMonth() < 9) ? '0' + (d.getMonth() + 1) : d.getMonth() + 1 ) + '-' + ((d.getDate() < 10) ? '0' + d.getDate() : d.getDate());
            eventdate = <tr className="name"><td>Date Collected</td><td className="val">{formatedDC}</td></tr>;
        }
        var lat = null, lon = null;
        if(index.geopoint){
            lat = <tr className="name"><td>Latitude</td><td className="val">{index.geopoint.lat}</td></tr>;
            lon = <tr className="name"><td>Longitude</td><td className="val">{index.geopoint.lon}</td></tr>;
        }
        return (
            <div className="container-fluid">
                <div className="row">
                    <div id="content" className="col-lg-7 col-lg-offset-2 col-md-9 col-md-offset-1 col-sm-10">
                        <h1 id="banner">Specimen Record</h1>
                        <div id="summary" className="section scrollspy">{this.taxaBreadCrumbs()}</div>
                        <Title data={this.props.record}  attribution={this.props.record.attribution}/>
                        <div id="summary-info" className="clearfix">
                            <div className="pull-left sec">
                                <table>
                                  <tbody>
                                    {this.namedTableRows(index, ['continent','country','stateprovince','county','city','locality'], fields.byTerm)}
                                    {lat}
                                    {lon}
                                  </tbody>
                                </table>
                            </div>
                            <div className="pull-left sec collection">
                                <table>
                                  <tbody>
                                    {this.namedTableRows(data, ['dwc:institutionCode','dwc:collectionCode','dwc:catalogNumber','dwc:recordedBy'], fields.byDataTerm)}
                                    {eventdate}
                                  </tbody>
                                </table>
                            </div>
                        </div>
                        <Map data={index} />
                        <Gallery data={index} />
                        <Provider data={this.props.record.attribution} />
                        {/*<Citation data={this.props.record} pubname={this.props.pubname} /> */}
                        <Record record={record} raw={this.props.record}/>
                    </div>
                    <div className="col-lg-2 col-md-2 col-sm-2">
                        <div id="side-nav">
                            {this.navList()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}
export default RecordPage;

