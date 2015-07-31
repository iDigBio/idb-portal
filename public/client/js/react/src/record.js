
var React = require('react')
var dwc = require('../../lib/dwc_fields');
var _ = require('lodash');
var fields = require('../../lib/fields');

var Row = React.createClass({
    render: function(){
        var name = _.isUndefined(dwc.names[this.props.keyid]) ? this.props.keyid : dwc.names[this.props.keyid];
        var regex = /[\A|\s]+(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=;]+)/g;
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
});

var Section = React.createClass({
    render: function(){
        var rows = [],self=this;
        var data = this.props.data;

        _.each(data,function(fld){
            var key = Object.keys(fld)[0];
            if(_.isString(fld[key])){
                rows.push(<Row key={key} keyid={key} data={fld[key]}/>);
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
            <div id={this.props.name} className={cl} >
                <h5>{dwc.names[this.props.name]}</h5>
                <table className="table table-striped table-condensed table-bordered">
                    {rows}
                </table>
            </div>
        );
    }
});

var Flags = React.createClass({
    render: function(){
        var rows = _.map(this.props.flags, function(flag){
            return (
                <tr><td>{flag}</td></tr>
            )
        })

        return (
            <div id="flags" style={{display: (this.props.active ? 'block' : 'none' )}}>
                <table className="table table-striped table-bordered table-condensed">
                    {rows}
                </table>
            </div>
        )
    }
});

var Record = React.createClass({
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
                
                <ul onClick={this.tabClick}>
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
});

var Img = React.createClass({
    error: function(event){
        $(event.currentTarget).attr('src','/portal/img/missing.svg');
    },
    render: function(){
        return (
            <a href={'/portal/mediarecords/'+this.props.keyid} title="click to open media record">
                <img className="gallery-image" onError={this.error} src={'https://media.idigbio.org/mrlookup/'+this.props.keyid+'?size=webview'} /> 
            </a>
        );
    }
});

var Gallery = React.createClass({
    render: function(){
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
});

var Map = React.createClass({
    render: function(){
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
});

var Provider = require('./shared/provider');
var Title = require('./shared/title');

module.exports = React.createClass({
    navList: function(){

        var map = this.props.record.indexTerms.geopoint ?  <li><a href="#map">Map</a></li> : null;
        var media = this.props.record.indexTerms.hasImage ? <li><a href="#media">Media</a></li> : null;

        return(
            <ul id="side-nav-list">
                <li className="title">Contents</li>
                <li><a href="#summary">Summary</a></li>
                {map}
                {media}
                <li><a href="#attribution">Attribution</a></li>
                <li><a href="#data">All Data</a></li>
            </ul>            
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
                <a 
                    key={'bread-'+item} 
                    href={'/portal/search?rq={'+search.join(',')+'}'}
                    title={'SEARCH '+title.join(', ')}
                >{_.capitalize(values[index])}</a>
            );
            if((order.length-1) > index){
                output.push(<span key={'arrow'+index}>&nbsp;>&nbsp;</span>);
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
                values.push(<tr key={'named-'+item} className="name"><td>{dic[item].name}</td><td className="val">{vals}</td></tr>);
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
            eventdate = <tr className="name"><td>Date Collected</td><td className="val">{index.eventdate}</td></tr>;
        }
        var lat = null, lon = null;
        if(index.geopoint){
            lat = <tr className="name"><td>Latitude</td><td className="val">{index.geopoint.lat}</td></tr>;
            lon = <tr className="name"><td>Longitude</td><td className="val">{index.geopoint.lon}</td></tr>;
        }
        return (
            <div className="container-fluid">
                <div className="row">
                    <div id="content" className="col-lg-7 col-lg-offset-2 col-md-10 col-sm-10"> 
                        <h1 id="banner">Specimen Records</h1> 
                        <div id="summary" className="section scrollspy">{this.taxaBreadCrumbs()}</div>
                        <Title data={this.props.record}  attribution={this.props.record.attribution}/>
                        <div id="summary-info" className="clearfix">
                            <div className="pull-left sec">
                                <table>
                                {this.namedTableRows(index, ['continent','country','stateprovince','county','city','locality'], fields.byTerm)}
                                {lat}
                                {lon}
                                </table>
                            </div>
                            <div className="pull-left sec collection">
                                <table>
                                {this.namedTableRows(data, ['dwc:institutionCode','dwc:collectionCode','dwc:catalogNumber','dwc:recordedBy'], fields.byDataTerm)}
                                {eventdate}
                                </table>
                            </div>
                        </div>
                        <Map data={index} />
                        <Gallery data={index} /> 
                        <Provider data={this.props.record.attribution} />                       
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

})
