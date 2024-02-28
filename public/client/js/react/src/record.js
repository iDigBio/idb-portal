import React, {useEffect, useState} from 'react';
import Provider from './shared/provider';
import Title from './shared/title';
import dwc from '../../lib/dwc_fields';
import _ from 'lodash';
import moment from 'moment';
import fields from '../../lib/fields';
import dqFlags from '../../lib/dq_flags';
import idbapi from '../../lib/idbapi';

const
    NO_DEMO_BGCOLOR = false,
    DEMO_BGCOLOR = 'palegreen';

const Row = ({keyid, data}) => {

    var name = _.isUndefined(dwc.names[keyid]) ? keyid : dwc.names[keyid];
    var regex = /[\A|\s]*(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=;]+)/g;
    var str = data.replace(regex, function(match){
        var href = match.replace(/(;|=|\+|!|&|,|\(|\)|\*|'|#)$/, '');
        return "<a target=\"_outlink\" href=\""+href+"\">"+match+"</a>";

    });
    return (
        <tr className="data-rows" style={!NO_DEMO_BGCOLOR && keyid == 'dwc:associatedOccurrences' ? {backgroundColor: DEMO_BGCOLOR} : {}}>
            <td className="field-name" style={{width:'50%'}}>{name}</td>
            <td className="field-value" style={{width:'50%'}} dangerouslySetInnerHTML={{__html: str}}></td>
        </tr>
    );

};

/**
 * @param {object} props
 * @param {string} props.name Section ID name, corresponding to dwc_fields.js.
 *      If 'idhistory:<number>', {@link data} is handled differently.
 * @param {object|object[]} props.data Field key-values specific to this section.
 *      If {@link name} is 'idhistory:<number>', this will instead be expected to be an array.
 * @param {boolean} props.active If `true`, assign CSS class to allow this section to be visible.
 */
const Section = ({name, data, active}) => {

    var rows = []
    var data = data;

    if(name.startsWith('idhistory')){
        _.forIn(data,function(fieldValue, fieldKey){
            if(_.isString(fieldValue)){
                rows.push(<Row key={fieldKey} keyid={fieldKey} data={fieldValue} />);
            }
        })
    }else{
        _.each(data,function(fld){
            var key = Object.keys(fld)[0];
            if(_.isString(fld[key])){
                rows.push(<Row key={key} keyid={key} data={fld[key]} />);
            }
        });
    }
    var cl = "section visible-print-block";
    if(active){
        cl="section";
    }
    let isDemoContent = !NO_DEMO_BGCOLOR && (['extendedspecimen'].includes(name) || name.startsWith('idhistory'));
    /** @type {string} */
    let sectionName = (name.startsWith('idhistory') && name.includes(':')
        ? dwc.names['idhistory'] +' '+ name.split(':')[1]
        : dwc.names[name]);
    return (
        <div id={name} className={cl} style={isDemoContent ? {backgroundColor: DEMO_BGCOLOR} : {}} >
            <h5>{sectionName}</h5>
            <table className={`table ${ isDemoContent ? '' : 'table-striped' } table-condensed table-bordered`} >
                <tbody>{rows}</tbody>
            </table>
        </div>
    );

};

const Flags = ({flags, active}) => {

    var rows = _.map(flags, function(flag){
        return (
            <tr key={'flag-'+flag}><td>{flag}</td><td>{dqFlags[flag]}</td></tr>
        )
    })

    return (
        <div id="flags" style={{display: (active ? 'block' : 'none' )}}>
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

};

/**
 * @param {object} props
 * @param {object} props.record {@linkcode props.raw}, after processing through dwc_fields.js
 * @param {object} props.raw Raw search API JSON response for a record
 */
const Record = ({record, raw }) => {
    const [active, setActive] = useState("record")
    const [nonPropsRecord, setNonPropsRecord] = useState([])
    const [recordIdHistory, setRecordIdHistory] = useState([])

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
        // this.setState({active: e.target.attributes['data-tab'].value});
        setActive(e.target.attributes['data-tab'].value)
    }

    useEffect(() => {

            var has = [];
            var non_props_record = [];
            var record_id_history = [];
            var sorder = ['extendedspecimen','taxonomy','specimen','collectionevent','locality','paleocontext','idhistory','other'];
            var cnt = 0;

            // Record tab rendering
            sorder.forEach(function(sec,index){
                if(_.has(record,sec)){
                    var active=true;
                    if(cnt===0){
                        active=true;
                    }
                    if(sec==='idhistory'){
                        //FIXME Implementation duplicated below (at "Render Identification History into its own tab")
                        if(!Array.isArray(record[sec])){
                            console.error('error creating section \'idhistory\': not an array');
                        }else{
                            record[sec].forEach((iden,iiden)=>{
                                non_props_record.push(<Section key={`sec-${sec}-${cnt}-${iiden}`} name={`${sec}:${iiden+1}`} data={iden} active={active} />);
                            });
                        }
                    }else{
                        non_props_record.push(<Section key={'sec-'+sec} name={sec} data={record[sec]} active={active} />);
                    }
                    cnt++;
                }
            });
            setNonPropsRecord([...nonPropsRecord, non_props_record])

            // Render Identification History into its own tab, if applicable.
            //
            // Basically duplicate code from the 'idhistory' carve-out for Record tab rendering above
            // (while indecisive about where we want to put this)
            let sec = 'idhistory';
            if(_.has(record,sec)){
                var active=true;
                if(!Array.isArray(record[sec])){
                    console.error('error creating section \'idhistory\': not an array');
                }else{
                    record[sec].forEach((iden,iiden)=>{
                        record_id_history.push(<Section key={`idhist-sec-${sec}-${iiden}`} name={`${sec}:${iiden+1}`} data={iden} active={active} />);
                    });
                }
            }
            setRecordIdHistory([...recordIdHistory, record_id_history])
    }, []);

    let
        doRenderIdHistory = !!raw.indexTerms?.indexData?.['dwc:Identification'],
        doRenderFlags = !!raw.indexTerms.flags;

    return (
        <div id="data" className="scrollspy section">

            <ul className="tabs" onClick={tabClick}>
                <li className={active == 'record' ? 'active' : ''} data-tab="record">Data</li>
                {doRenderIdHistory ? <li className={active == 'idhistory' ? 'active' : ''} data-tab="idhistory" style={!NO_DEMO_BGCOLOR ? {backgroundColor: DEMO_BGCOLOR} : {}}>ID History</li> : ''}
                {doRenderFlags ? <li className={active == 'flags' ? 'active' : ''} data-tab="flags">Flags</li> : ''}
                <li className={active == 'raw' ? 'active' : ''} data-tab="raw">Raw</li>
            </ul>
            <div id="record" className="clearfix" style={{display: (active == 'record' ? 'block' : 'none' )}}>
                {nonPropsRecord}
            </div>
            {doRenderIdHistory ? <div id="idhistory" className="clearfix" style={{display: (active == 'idhistory' ? 'block' : 'none' ), backgroundColor: (!NO_DEMO_BGCOLOR ? DEMO_BGCOLOR : '')}}>{recordIdHistory}</div> : ''}
            {doRenderFlags ? <Flags flags={raw.indexTerms.flags} active={active == 'flags'} /> : ''}
            <div id="raw" style={{display: (active == 'raw' ? 'block' : 'none' )}}>
                <p id="raw-body" dangerouslySetInnerHTML={{__html: formatJSON(raw)}}>
                </p>
            </div>
        </div>
    );

};

const Img = ({keyid}) => {
    function error(event){
        $(event.currentTarget).attr('src','/portal/img/missing.svg');
    }

    return (
        <a href={'/portal/mediarecords/'+keyid} title="click to open media record">
            <img className="gallery-image" onError={error} src={idbapi.media_host + 'v2/media/'+keyid+'?size=webview'} />
        </a>
    );

};

const Gallery = ({data}) => {

    if(_.has(data,'mediarecords')){

        var imgs = [];

        _.each(data.mediarecords,function(item){
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

};

const Map = ({data}) => {

    if(_.has(data,'geopoint')){
        return (
            <div id="map" className="clearfix scrollspy section">

                <div id="map-wrapper">
                    <div id="map-box"></div>
                </div>
            </div>
        )
    }else{
        return <span />
    }

};


const SuppliedCitation = ({data}) => {

    if(_.has(data,'dcterms:bibliographicCitation')){
        return (
            <div id="citation" className="clearfix scrollspy section">
                <div>The provider has specified the following citation for use with this data.</div>
                <div id="citationText" className="citationtext">{data['dcterms:bibliographicCitation']}</div>
            </div>
        )
    }else{
        return(null);
    }

};

const Citation = ({data, pubname}) => {


    return(
        <div id="citation" className="clearfix scrollspy section">
            <h2 className="title">Citation</h2>
            <SuppliedCitation data={data.data} />
            <div>This is the constructed <a href="https://www.idigbio.org/content/citation-guidelines">iDigBio Citation Format</a> using information supplied by the data provider.</div>
            <div id="citationText" className="citationtext">
                {_.has(data.data, 'dwc:occurrenceID') && data.data['dwc:occurrenceID'] + '. '}
                {_.has(data.data, 'dwc:catalogNumber') && data.data['dwc:catalogNumber'] + '. '}
                {_.has(data.attribution, 'name') && data.attribution['name'] + '. '}
                <a href={"https://search.idigbio.org/v2/search/publishers?pq={%22uuid%22:%22"+data.attribution['publisher']+"%22}"}>{pubname}</a>.
                <a href={"/portal/recordsets/"+data.attribution.uuid}> http://portal.idigbio.org/portal/recordsets/{data.attribution.uuid}</a>.
                Accessed on {moment().format("LL")}.
            </div>
        </div>
    )

};

/**
 * @param {object} props
 * @param {object} props.record Raw search API JSON response for a record from /view/records/:id
 */
const RecordPage = ({ record }) => {
    const navList = () => {
        const map = record.indexTerms.geopoint ? <li><a href="#map">Map</a></li> : null;
        const media = record.indexTerms.hasImage ? <li><a href="#media">Media</a></li> : null;

        return (
            <ul id="side-nav-list">
                <li className="title">Contents</li>
                <li><a href="#summary">Summary</a></li>
                {map}
                {media}
                <li><a href="#attribution">Attribution</a></li>
                <li><a href="#citation">Citation</a></li>
                <li><a href="#data">All Data</a></li>
            </ul>
        );
    };

    const taxaBreadCrumbs = () => {
        const order = [], values = [];

        ['kingdom', 'phylum', 'class', 'order', 'family'].forEach(item => {
            if (_.has(record.indexTerms, item)) {
                order.push(item);
                values.push(record.indexTerms[item]);
            }
        });

        const output = [];

        order.forEach((item, index) => {
            const search = [], title = [];
            for (let i = 0; i <= index; i++) {
                search.push('"' + order[i] + '":' + '"' + values[i] + '"');
                title.push(order[i] + ': ' + values[i]);
            }
            output.push(
                <a
                    key={'bread-' + item}
                    href={'/portal/search?rq={' + search.join(',') + '}'}
                    title={'SEARCH ' + title.join(', ')}
                >{_.capitalize(values[index])}</a>
            );
            if ((order.length - 1) > index) {
                output.push(<span key={'arrow' + index}>&nbsp;{'>'}&nbsp;</span>);
            }
        });

        return output;
    };

    const namedTableRows = (data, list, dic) => {
        const values = [];
        _.each(list, item => {
            if (_.has(data, item)) {
                const vals = _.map(_.words(data[item], /[^ ]+/g), i => _.capitalize(i)).join(' ');
                values.push(<tr key={'named-' + item} className="name"><td>{dic[item].name}</td><td className="val">{vals}</td></tr>);
            }
        });
        return values;
    };

    const data = record.data, index = record.indexTerms;
    const has = [], canonical = {};
    let eventdate = null, lat = null, lon = null;
    let localRecord = {}
    _.forOwn(index, function (v, k) {
        if (_.has(fields.byTerm, k) && _.has(fields.byTerm[k], 'dataterm')) {
            const dt = fields.byTerm[k].dataterm;
            canonical[dt] = _.has(data, dt) ? data[dt] : v;
        }
    });

    _.defaults(canonical, data);

    _.each(dwc.order, function (val, key) {
        if (key === 'idhistory') {
            /* Requires special handling to flatten:
             * Unlike other sections, this one is an array.
             *
             * We SHOULD get:
             * localRecord: {
             *   idhistory: [{
             *     idfield1_1: ...,
             *     idfield1_2: ...,
             *     ...
             *   },{
             *     idfield2_1: ...,
             *     idfield2_2: ...,
             *     ...
             *   },
             *   ...
             *   ]
             * }
             * Otherwise, with the original implementation under 'else',
             * we end up with:
             * localRecord: {
             *   idhistory: [{
             *     'dwc:Identification': [{
             *       idfield1_1: ...,
             *       idfield1_2: ...,
             *       ...
             *     },{
             *       idfield2_1: ...,
             *       idfield2_2: ...,
             *       ...
             *     },
             *     ...
             *     ]
             *   }]
             * }
             */
            const fld = 'dwc:Identification';
            if (_.has(canonical, fld)) {
                if (!_.has(localRecord, key)) {
                    localRecord[key] = [];
                }
                if (!_.isArray(canonical[fld]))
                    console.error('error parsing field \'%s\': expected an array', fld);
                _.forEach(canonical[fld], function (iden) {
                    let datum = {};
                    _.forIn(iden, function(idenFieldValue, idenFieldName) {
                        datum[idenFieldName] = idenFieldValue;
                    });
                    localRecord[key].push(datum);
                })
                has.push(fld);
            }
        } else {
            _.each(dwc.order[key], function (fld) {
                if (_.has(canonical, fld)) {
                    if (!_.has(localRecord, key)) {
                        localRecord[key] = [];
                    }
                    let datum = {};
                    datum[fld] = canonical[fld];
                    localRecord[key].push(datum);
                    has.push(fld);
                }
            });
        }
    });

    const dif = _.difference(Object.keys(canonical), has);
    _.each(dif, function (item) {
        if (item.indexOf('idigbio:') === -1) {
            if (_.isUndefined(record['other'])) {
                localRecord['other'] = [];
            }
            const datum = {};
            datum[item] = canonical[item];
            localRecord['other'].push(datum);
        }
    });

    if (index.datecollected) {
        const d = new Date(index.datecollected);
        d.setTime(d.getTime() + d.getTimezoneOffset() * 60000);
        const formatedDC = `${d.getFullYear()}-${d.getMonth() < 9 ? '0' : ''}${d.getMonth() + 1}-${d.getDate() < 10 ? '0' : ''}${d.getDate()}`;
        eventdate = <tr className="name"><td>Date Collected</td><td className="val">{formatedDC}</td></tr>;
    }

    if (index.geopoint) {
        lat = <tr className="name"><td>Latitude</td><td className="val">{index.geopoint.lat}</td></tr>;
        lon = <tr className="name"><td>Longitude</td><td className="val">{index.geopoint.lon}</td></tr>;
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div id="content" className="col-lg-7 col-lg-offset-2 col-md-9 col-md-offset-1 col-sm-10">
                    <h1 id="banner">Specimen Record</h1>
                    <div id="summary" className="section scrollspy">{taxaBreadCrumbs()}</div>
                    <Title data={record} attribution={record.attribution} />
                    <div id="summary-info" className="clearfix">
                        <div className="pull-left sec">
                            <table>
                                <tbody>
                                {namedTableRows(index, ['continent', 'country', 'stateprovince', 'county', 'city', 'locality'], fields.byTerm)}
                                {lat}
                                {lon}
                                </tbody>
                            </table>
                        </div>
                        <div className="pull-left sec collection">
                            <table>
                                <tbody>
                                {namedTableRows(data, ['dwc:institutionCode', 'dwc:collectionCode', 'dwc:catalogNumber', 'dwc:recordedBy'], fields.byDataTerm)}
                                {eventdate}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Map data={index} suppressHydrationWarning={true} />
                    <Gallery data={index} />
                    <Provider data={record.attribution} />
                    <Record record={localRecord} raw={record} suppressHydrationWarning={true} />
                </div>
                <div className="col-lg-2 col-md-2 col-sm-2">
                    <div id="side-nav">
                        {navList()}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RecordPage;

