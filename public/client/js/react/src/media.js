
var React = require('react');
var dwc = require('../../lib/dwc_fields');
var _ = require('lodash');
var idbapi = require('../../lib/idbapi');

class Media extends React.Component{
    errorImage(e){
        e.target.attributes['src'].value = '/portal/img/missing.svg';
    }
    render(){
        var link='';
        if(_.has(this.props.data,'ac:accessURI')){
            link = this.props.data['ac:accessURI'];
        }else if(_.has(this.props.data,'ac:bestQualityAccessURI')){
            link = this.props.data['ac:bestQualityAccessURI'];
        }else if(_.has(this.props.data, 'dcterms:identifier')){
            link = this.props.data['dcterms:identifier'];
        }

        return (
            <div key={this.props.keyid} id="media-wrapper" className="scrollspy section clearfix" >
                <a className="clearfix" target={'_'+this.props.keyid} href={link} title="click to open original media file">
                    <img className="media" 
                    src={idbapi.media_host + 'v2/media/'+this.props.keyid+'?size=webview'} 
                    onError={this.errorImage}/>
                </a>
                 Media retrieved from:<br />{link}
                <a className="media-link hidden-print" href={link} target={'_'+this.props.keyid} title="click to open original media file">
                    Open in browser<br />
                </a>
                <a className="media-link hidden-print" href={link} download={this.props.keyid} target={'_'+this.props.keyid} title="click to open original media file">
                    Download File<br />
                </a>
            </div>
        );

    }
    componentDidMount(){
        
    }
};

class Table extends React.Component{
    // getInitialState(){
    //     return {active: 'record'};
    // }
    constructor(props) {
        super(props)
        this.state = {
            active: 'record'
        }
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
    tabClick(e){
        e.preventDefault();
        this.setState({active: e.target.attributes['data-tab'].value});
    }
    render(){
        var order=[],rows=[],self=this;

        //make ordered name keys
        _.each(dwc.order.media,function(val){
            if(_.has(self.props.record.data, val)){
                order.push(val);
            }
        });
        //add unknown keys to end of list
        var dif = _.difference(Object.keys(this.props.record.data),order);
        var merged = order.concat(dif), count=0;
        var regex = /(\bhttps?:\/\/(\S|\w| )+)/;

        _.each(order,function(key){
            var name = _.isUndefined(dwc.names[key]) ? key: dwc.names[key];
            var val = self.props.record.data[key];
            if(_.isString(val)){
                var str;
                if(val.indexOf('<a')===0){
                    str = val;
                }else{
                    str = val.replace(regex, "<a href=\"$1\">$1</a>");
                }
                rows.push(
                    <tr key={count}>
                        <td className="name">{name}</td>
                        <td className="value" dangerouslySetInnerHTML={{__html: str}}></td>
                    </tr>
                );                
            }else if(_.isArray(val)){
                rows.push(
                    <tr key={count}>
                        <td className="name">{name}</td>
                        <td className="value">{val.join(', ')}</td>
                    </tr>
                );                 
            }else{
                rows.push(
                    <tr key={count}>
                        <td className="name">{name}</td>
                        <td className="value">{val}</td>
                    </tr>
                );                 
            }
            count++;
        });

        return (
            <div id="data-table" className="scrollspy">
                <ul className="tabs" onClick={this.tabClick}>
                    <li className={this.state.active == 'record' ? 'active' : ''} data-tab="record">Data</li>
                    <li className={this.state.active == 'raw' ? 'active' : ''} data-tab="raw">Raw</li>
                </ul>
                <section id="record" className="clearfix" style={{display: (this.state.active == 'record' ? 'block' : 'none' )}}>
                    <table className="table table-striped table-condensed table-bordered">
                    <tbody>{rows}</tbody>
                    </table>
                </section>
                <section id="raw" style={{display: (this.state.active == 'raw' ? 'block' : 'none' )}}>
                    <p id="raw-body" dangerouslySetInnerHTML={{__html: this.formatJSON(this.props.record)}}>
                    </p>  
                </section>  
            </div>
        );
    }
};

class Group extends React.Component{
    errorImage(e){
        e.target.attributes['src'].value = '/portal/img/missing.svg';
    }
    render(){
        if( _.has(this.props.record,'indexTerms') && _.has(this.props.record.indexTerms,'mediarecords') && this.props.record.indexTerms.mediarecords.length > 1){
            var imgs = [];
            var media = this.props.record.indexTerms.mediarecords;
            for(var id in media){
                if(media[id] != this.props.keyid){
                    imgs.push(
                        <a href={'/portal/mediarecords/'+media[id]} title="click to open media record" key={media[id]} >
                            <img className="gallery-image" src={idbapi.media_host + 'v2/media/'+media[id]+'?size=webview'} onError={this.errorImage} />
                        </a>
                    )                    
                }
            }
            return (
                <div id="other-images" className="clearfix scrollspy section">
                    <h4 className="title">Other Media</h4>
                    <div id="images-wrapper">
                        {imgs}
                    </div>
                </div>
            )
        }else{
            return null;
        }
    }
};

var Provider = require('./shared/provider');
var Raw = require('./shared/raw');
var Title = require('./shared/title');

class mediaModExports extends React.Component{
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
                    href={'/portal/search?rq={'+search.join(',')+'}&view=media'}
                    title={'SEARCH MEDIA '+title.join(', ')}
                >{_.capitalize(values[index])}</a>
            );
            if((order.length-1) > index){
                output.push(<span key={'arrow'+index}>&nbsp;>&nbsp;</span>);
            }
        });

        return output;
    }
    navList(){

        var othermedia = null;
        //var med = this.props.indexTerms.mediarecords

        if( _.has(this.props.record,'indexTerms') && _.has(this.props.record.indexTerms,'mediarecords') && this.props.record.indexTerms.mediarecords.length > 1){
            othermedia = <li><a href="#other-images">Other Media</a></li>
        }

        return(
            <ul id="side-nav-list">
                <li className="title">Contents</li>
                <li><a href="#media-wrapper">Media</a></li>
                {othermedia}
                <li><a href="#attribution">Attribution</a></li>
                <li><a href="#data-table">All Data</a></li>
            </ul>  
        )
    }
    render(){
        var source = this.props.mediarecord;
        var info=[];
        
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-7 col-lg-offset-2 col-md-9 col-md-offset-1 col-sm-10" id="container">
                        <h1 id="banner">Media Record</h1> 
                        <span id="summary">{this.taxaBreadCrumbs()}</span>  
                        <Title data={this.props.record} attribution={this.props.mediarecord.attribution} includeLink={true} mediaSearch={true} />
                        <Media key={source.uuid+'_media'} keyid={source.uuid} data={source.data} />
                        <Group record={this.props.record} keyid={source.uuid} />
                        <Provider data={this.props.mediarecord.attribution} />
                        <Table record={source} />
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
module.exports = mediaModExports
