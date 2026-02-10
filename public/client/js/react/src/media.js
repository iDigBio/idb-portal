
import React, {useEffect, useState} from "react";
import dwc from '../../lib/dwc_fields';
import _ from 'lodash';
import idbapi from '../../lib/idbapi';
import Provider from './shared/provider';
import Raw from './shared/raw';
import Title from './shared/title';




const Media = ({keyid, data}) => {
    const [link, setLink] = useState('')
    function errorImage(e){
        e.target.attributes['src'].value = '/portal/img/missing.svg';
    }

    useEffect(() => {
        var link='';
        if(_.has(data,'ac:accessURI')){
            // link = data['ac:accessURI'];
            setLink(data['ac:accessURI'])
        }else if(_.has(data,'ac:bestQualityAccessURI')){
            // link = data['ac:bestQualityAccessURI'];
            setLink(data['ac:bestQualityAccessURI'])
        }else if(_.has(data, 'dcterms:identifier')){
            // link = data['dcterms:identifier'];
            setLink(data['dcterms:identifier'])
        }
    }, []);

    return (
        <div key={keyid} id="media-wrapper" className="scrollspy section clearfix" >
            <a className="clearfix" target={'_'+keyid} href={link} title="click to open original media file">
                <img className="media"
                alt="Specimen media"
                src={idbapi.media_host + 'v2/media/'+keyid+'?size=webview'}
                onError={errorImage}/>
            </a>
             Media retrieved from:<br />{link}
            <a className="media-link hidden-print" href={link} target={'_'+keyid} title="click to open original media file">
                Open in browser<br />
            </a>
            <a className="media-link hidden-print" href={link} download={keyid} target={'_'+keyid} title="click to open original media file">
                Download File<br />
            </a>
        </div>
    );

};

const Table = ({record}) => {
    const [active, setActive] = useState('record')
    const [rows, setRows] = useState([])
    function formatJSON(json){
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
    function tabClick(e){
        e.preventDefault();
        setActive(e.target.attributes['data-tab'].value)
        // this.setState({active: e.target.attributes['data-tab'].value});
    }
    function handleKeyDown(e){
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            tabClick(e);
        }
    }

    useEffect(() => {

        var order=[]
        var temp_rows = []

        //make ordered name keys
        _.each(dwc.order.media,function(val){
            if(_.has(record.data, val)){
                order.push(val);
            }
        });
        //add unknown keys to end of list
        var dif = _.difference(Object.keys(record.data),order);
        var merged = order.concat(dif), count=0;
        var regex = /(\bhttps?:\/\/(\S|\w| )+)/;

        _.each(order,function(key){
            var name = _.isUndefined(dwc.names[key]) ? key: dwc.names[key];
            var val = record.data[key];
            if(_.isString(val)){
                var str;
                if(val.indexOf('<a')===0){
                    str = val;
                }else{
                    str = val.replace(regex, "<a href=\"$1\">$1</a>");
                }
                temp_rows.push(
                    <tr key={count}>
                        <td className="name">{name}</td>
                        <td className="value" dangerouslySetInnerHTML={{__html: str}}></td>
                    </tr>
                );
            }else if(_.isArray(val)){
                temp_rows.push(
                    <tr key={count}>
                        <td className="name">{name}</td>
                        <td className="value">{val.join(', ')}</td>
                    </tr>
                );
            }else{
                temp_rows.push(
                    <tr key={count}>
                        <td className="name">{name}</td>
                        <td className="value">{val}</td>
                    </tr>
                );
            }
            count++;
        });
        setRows([...rows, temp_rows])
    }, []);


    return (
        <div id="data-table" className="scrollspy">
            <ul className="tabs" onClick={tabClick} role="tablist">
                <li className={active == 'record' ? 'active' : ''} data-tab="record" onKeyDown={handleKeyDown} role="tab" tabIndex={0}>Data</li>
                <li className={active == 'raw' ? 'active' : ''} data-tab="raw" onKeyDown={handleKeyDown} role="tab" tabIndex={0}>Raw</li>
            </ul>
            <section id="record" className="clearfix" style={{display: (active == 'record' ? 'block' : 'none' )}}>
                <table className="table table-striped table-condensed table-bordered">
                <tbody>{rows}</tbody>
                </table>
            </section>
            <section id="raw" style={{display: (active == 'raw' ? 'block' : 'none' )}}>
                <p id="raw-body" dangerouslySetInnerHTML={{__html: formatJSON(record)}}>
                </p>
            </section>
        </div>
    );

};

const Group = ({record, keyid}) => {
    // constructor(props) {
    //     super(props);
    //     this.errorImage = this.errorImage.bind(this)
    // }
    function errorImage(e){
        e.target.attributes['src'].value = '/portal/img/missing.svg';
    }


    if( _.has(record,'indexTerms') && _.has(record.indexTerms,'mediarecords') && record.indexTerms.mediarecords.length > 1){
        var imgs = [];
        var media = record.indexTerms.mediarecords;
        for(var id in media){
            if(media[id] != keyid){
                imgs.push(
                    <a href={'/portal/mediarecords/'+media[id]} title="click to open media record" key={media[id]} >
                        <img className="gallery-image" alt="Related specimen media" src={idbapi.media_host + 'v2/media/'+media[id]+'?size=webview'} onError={errorImage} />
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
        console.log('still working')
        return null;
    }

};



const MediaModExports = ({record, mediarecord}) => {
    // constructor(props) {
    //     super(props);
    //
    //     this.taxaBreadCrumbs = this.taxaBreadCrumbs.bind(this)
    //     this.navList = this.navList.bind(this)
    // }
    function taxaBreadCrumbs(){
        var order = [], values = [], self = this;
        
        ['kingdom','phylum','class','order','family'].forEach(function(item){
            if(_.has(record.indexTerms,item)){
                order.push(item);
                values.push(record.indexTerms[item]);
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
    function navList(){

        var othermedia = null;
        //var med = this.props.indexTerms.mediarecords

        if( _.has(record,'indexTerms') && _.has(record.indexTerms,'mediarecords') && record.indexTerms.mediarecords.length > 1){
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

    // var source = this.props.mediarecord;
    var info=[];

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-lg-7 col-lg-offset-2 col-md-9 col-md-offset-1 col-sm-10" id="container">
                    <h1 id="banner">Media Record</h1>
                    <span id="summary">{taxaBreadCrumbs()}</span>
                    <Title data={record} attribution={mediarecord.attribution} includeLink={true} mediaSearch={true} />
                    <Media key={mediarecord.uuid+'_media'} keyid={mediarecord.uuid} data={mediarecord.data} />
                    <Group record={record} keyid={mediarecord.uuid} />
                    <Provider data={mediarecord.attribution} />
                    <Table record={mediarecord} />
                </div>
                <div className="col-lg-2 col-md-2 col-sm-2">
                    <div id="side-nav">
                        {navList()}
                    </div>
                </div>
            </div>
        </div>
    )

}
export default MediaModExports;
