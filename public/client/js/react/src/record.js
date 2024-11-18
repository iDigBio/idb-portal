import React, {useEffect, useState} from 'react';
import Provider from './shared/provider';
import Title from './shared/title';
import dwc from '../../lib/dwc_fields';
import _ from 'lodash';
import moment from 'moment';
import fields from '../../lib/fields';
import dqFlags from '../../lib/dq_flags';
import idbapi from '../../lib/idbapi';
import { ConfigProvider, Table } from 'antd';

const ESO_HIDE_FIELD = -1;
// Sections defined here will be given a table at the end of
// the record page, data section.
// For all fields defined within each section,
// set an integer to denote column ordering,
// where lower integers appear first/left-most.
// Undefined fields will be appended to the last/right-most end of the table.
// Fields set to ESO_HIDE_FIELD will not be displayed in the table.
//
//FIXME// Column sorting might not work properly.
// Example: For specimen where 'occurrence ID' is http://n2t.net/ark:/65665/319944bac-6847-4105-bb85-0cd03f5efad3,
// got column order: [..., Ratio of Absorbance (260/230 nm), Sample Designation, Ratio of Absorbance (260/280 nm)]
// expected 'Sample Designation' to be last
const extendedSpecimenOrder = {
    "idhistory" : {
        "symbiota:tidInterpreted": ESO_HIDE_FIELD,
        "dwc:scientificName": 1,
        "dwc:identifiedBy": 3,
        "idigbio:recordID": 6,
        "coreid": ESO_HIDE_FIELD,
        "dwc:scientificNameAuthorship": 5,
        "dwc:dateIdentified": 2,
        "dcterms:modified": 7,
    },
    "associatedtaxa": {
        "coreid": ESO_HIDE_FIELD,
        "aec:associatedRelationshipTerm": 1,
        "aec:associatedOccurrenceID": 2,
        "aec:associatedFamily": 3,
        "aec:associatedGenus": 4,
        "aec:associatedSpecificEpithet": 5,
        "aec:associatedScientificName": 6,
        "aec:associatedAuthor": 7,
        "aec:associatedCommonName": 8,
        "aec:associatedNotes": 9,
        "aec:associatedDeterminedBy": 10,
        "aec:associatedCondition": 11,
        "aec:associatedLocationOnHost": 12,
        "aec:associatedEmergenceVerbatimDate": 13,
        "aec:associatedCollectionLocation": 14,
        "aec:isCultivar": 15,
        "aec:associatedImageAccessURI": 16,
        "aec:associatedImageCreator": 17,
        "aec:associatedImageRights": 18,
        "aec:associatedRelationshipURI": 19,
    },
    "resourcerelationship": {
        "coreid": ESO_HIDE_FIELD,
        "dwc:resourceID": 1,
        "dwc:resourceRelationshipID": 2,
        "dwc:relationshipOfResource": 3,
        "dwc:relationshipOfResourceID": 4,
        "dwc:relatedResourceID": 5,
        "dwc:relationshipAccordingTo": 6,
        "dwc:relationshipEstablishedDate": 7,
        "dwc:relationshipRemarks": 8,
    },
    "extendedmeasurementorfact": {
        "coreid": ESO_HIDE_FIELD,
        "dwc:measurementValue": 1,
        "dwc:measurementType": 2,
        "dwc:measurementDeterminedBy": 3,
        "dwc:measurementDeterminedDate": 4,
        "obis:measurementValueID": 5,
        "obis:measurementTypeID": 6,
    },
    "materialsample": {
        "coreid": ESO_HIDE_FIELD,
        "ggbn:materialSampleType": 1,
        "ggbn:concentrationUnit": 2,
        "ggbn:concentration": 3,
        "ggbn:ratioOfAbsorbance260_230": 4,
        "ggbn:ratioOfAbsorance260_280": 5,
        "ggbn:sampleDesignation": 6,
    },
    "chronometricage": {
        "coreid": ESO_HIDE_FIELD,
        "chrono:minimumChronometricAge": 1,
        "chrono:minimumChronometricAgeReferenceSystem": 2,
        "chrono:maximumChronometricAge": 3,
        "chrono:maximumChronometricAgeReferenceSystem": 4,
        "chrono:chronometricAgeRemarks": 5,
        "chrono:chronometricAgeReferences": 6,
    },
}
import {Button, Tag, Grid, Flex} from 'antd'


/**
 * (See top of function definition for regex defining "qualified URLs")
 * @param {string} text - Text to scan for qualified URLs
 * @returns {React.JSX.Element} {@link text} within a &lt;span&gt; node, with qualified URLs replaced with hyperlinks
 * @example
 * // returns (<span>ABC <a ... href="http://example.com">http://example.com</a> XYZ</span>)
 * convertLinkText("ABC http://example.com XYZ");
 */
function convertLinkText(text) {
    if (!text || typeof text !== 'string') {
        return <span></span>;
    }
    // What shorthand character class is '\A'?
    const regex = /([\A|\s]*)(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=;]+)/g;
    return (<span dangerouslySetInnerHTML={{__html: text.replace(regex, function (match, p1, p2) {
        var href = p2.replace(/(;|=|\+|!|&|,|\(|\)|\*|'|#)$/, '');
        return p1+"<a target=\"_outlink\" href=\""+href+"\">"+p2+"</a>";
    })}} />)
}

const Row = ({keyid, data, interpreted}) => {
    let tag
    console.log(keyid, interpreted, data)
    if (interpreted) {
        tag = <Tag style={{marginLeft: '10px'}} color={'green'}>Interpreted</Tag>
    } else {
        // tag = <Tag style={{marginLeft: '10px'}} color={'red'}>Original</Tag>
        tag = <></>
            }

    var name = _.isUndefined(dwc.names[keyid]) ? keyid : dwc.names[keyid];
    var regex = /[\A|\s]*(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=;]+)/g;
    var str = data.replace(regex, function(match){
        var href = match.replace(/(;|=|\+|!|&|,|\(|\)|\*|'|#)$/, '');
        return "<a target=\"_outlink\" href=\""+href+"\">"+match+"</a>";
    });


    return (
        <tr className="data-rows">
            <td className="field-name" style={{width:'50%'}}>{name}</td>
            <td className="field-value" style={{width:'50%'}}>{convertLinkText(data)}{tag}</td>
            {/*<td style={{textAlign: "center"}}>{tag}</td>*/}
        </tr>
    );

};

/**
 * @param {object} props
 * @param {string} props.name Section ID name, corresponding to dwc_fields.js.
 * @param {object} props.data Field key-values specific to this section.
 * @param {boolean} props.active If `true`, assign CSS class to allow this section to be visible.
 */
const Section = ({name, data, active}) => {

    var rows = []
    var data = data;

    _.each(data,function(fld){
        var key = Object.keys(fld)[0];
        if(_.isString(fld[key])){
            rows.push(<Row key={key} keyid={key} data={fld[key]} interpreted={!!fld.interpreted} />);
        }
    });
    var cl = "section visible-print-block";
    if(active){
        cl="section";
    }
    /** @type {string} */
    let sectionName = dwc.names[name];
    return (
        <div id={name} className={cl}>
            <h5>{sectionName}</h5>
            <table className={`table table-striped table-condensed table-bordered`} >
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

    function formatJSON(json){
        console.log(json)
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

    /** Extracts keys from array of objects.
     *
     * {@link sec} is used for filtering out columns designated hidden
     * (see {@link extendedSpecimenOrder}).
     *
     * @param {object[]} arr Section data array
     * @param {string} sec Section name
     * @returns {string[]}
     */
    function extractKeys(arr, sec) {
        return arr.reduce((keys, obj) => {
            Object.keys(obj).forEach(key => {
                if (!keys.includes(key) && extendedSpecimenOrder[sec][key] != ESO_HIDE_FIELD) {
                    keys.push(key);
                }
            });
            return keys;
        }, [])
    }

    function getAntdColumns(keys, sec) { // takes a list of keys and formats them to be used as antd column headers
        const sorted_keys = keys.sort((a, b) => extendedSpecimenOrder[sec][a] - extendedSpecimenOrder[sec][b])
        return sorted_keys.map(key => ({
            title: _.isUndefined(dwc.names[key]) ? key : dwc.names[key],
            dataIndex: key,
            key: key,
            render: convertLinkText,
        }));
    }

    /**
     * Applies table data corrections prior to display:
     * - Instantiates missing keys to '' (empty string)
     * - Converts URLs within data values to hyperlinks
     *
     * @param {object[]} data - Section data array
     * @param {string[]} keys
     */
    function completeData(data, keys) {
        return data.map((item, index) => {
            keys.forEach(key => {
                if (!item.hasOwnProperty(key)) {
                    item[key] = '';
                }
            });
            return { ...item, key: index }
        });
    }

    /**
     * @param {object[]} recordSection Section data array
     * @param {string} sec Section name
     * @returns Section HTML for the given parameters, including header title
     */
    function getAntdTable(recordSection, sec) {
        const allKeys = extractKeys(recordSection, sec)
        const columns = getAntdColumns(allKeys, sec)
        const rows = completeData(recordSection, allKeys)
        return (<div id={sec} className='section'>
                    <h5>{dwc.names[sec]}</h5>
                    <ConfigProvider theme={{
                        // antd provides default styles with a higher CSS specificity;
                        // we don't want it overriding our styles

                        hashed: false, // removes .css-dev-only-do-not-override-* classes
                    }}>
                        <Table
                            className={'custom-antd-table'}
                            rowClassName={(record, index) => 'field-value ' + (index % 2 === 0 ? 'evenRow' : 'oddRow')}
                            columns={columns}
                            dataSource={rows}
                            scroll={{x: 'max-content'}}
                            pagination={false}
                        />
                    </ConfigProvider>
                </div>)
    }

    useEffect(() => {
            console.log('record=', record);
            console.log('raw=', raw);

        var has = [];
        /** @type {React.JSX.Element[]} */
        var non_props_record = [];
        var sorder = ['taxonomy', 'specimen', 'collectionevent', 'locality', 'paleocontext', ...Object.keys(extendedSpecimenOrder), 'other'];
        var cnt = 0;

        // Record tab rendering
        sorder.forEach(function (sec, index) {
            if (_.has(record, sec)) {
                var active = true;
                if (cnt === 0) {
                    active = true;
                }
                if (sec in extendedSpecimenOrder) {
                        if(!Array.isArray(record[sec])){
                            console.error('error creating section \'%s\': not an array', sec);
                        }else{
                            non_props_record.push(getAntdTable(record[sec], sec))
                        }
                    }
                    else{
                        non_props_record.push(<Section key={'sec-'+sec} name={sec} data={record[sec]} active={active} />);
                    }
                    cnt++;
                }
            });
            setNonPropsRecord([...nonPropsRecord, non_props_record])
    }, []);

    let doRenderFlags = !!raw.indexTerms.flags;

    return (
        <div id="data" className="scrollspy section">

            <ul className="tabs" onClick={tabClick}>
                <li className={active === 'record' ? 'active' : ''} data-tab="record">Data</li>
                {doRenderFlags ? <li className={active === 'flags' ? 'active' : ''} data-tab="flags">Flags</li> : ''}
                <li className={active === 'raw' ? 'active' : ''} data-tab="raw">Raw</li>
            </ul>
            <div id="record" className="clearfix" style={{display: (active === 'record' ? 'block' : 'none' )}}>
                {nonPropsRecord}
            </div>
            {doRenderFlags ? <Flags flags={raw.indexTerms.flags} active={active === 'flags'} /> : ''}
            <div id="raw" style={{display: (active === 'raw' ? 'block' : 'none' )}}>
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
                if (item.includes("dwc:")) {
                    values.push(<tr key={'named-' + item} className="name"><td>{dic[item].name}</td><td className="val">{vals}</td></tr>);
                } else {
                    values.push(
                        <tr key={'named-' + item} className="name">
                            <td>{dic[item].name}</td>
                            <td className="val">{vals}</td>
                            <td className='interpreted'><Tag color={"green"}>Interpreted</Tag></td>
                        </tr>
                    );
                }

            }
        });
        return values;
    };

    const data = record.data, index = record.indexTerms;
    const has = [], canonical = {};
    let eventdate = null, lat = null, lon = null;
    let localRecord = {}
    let interpreted = new Set()
    _.forOwn(index, function (v, k) {
        if (_.has(fields.byTerm, k) && _.has(fields.byTerm[k], 'dataterm')) {
            const dt = fields.byTerm[k].dataterm;
            if (_.has(data,dt)) {
                canonical[dt] = data[dt]
            } else {
                canonical[dt] = v
                interpreted.add(dt)
            }
        }
    });

    _.defaults(canonical, data);

    _.each(dwc.order, function (val, key) {
        if (key in extendedSpecimenOrder) {
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
            const fld = dwc.order[key][0];
            if (dwc.order[key].length > 1) {
                // If this soft assert fails, key might correspond to the incorrect DwC field
                console.warn("More than one value for dwc_fields order key '%s'. Using first value '%s'.", key, fld);
            }
            if (_.has(canonical, fld) && canonical[fld] !== '') {
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
                    if (interpreted.has(fld)) {
                        datum['interpreted'] = true
                    }
                    localRecord[key].push(datum);
                    has.push(fld);
                }
            });
        }
        // _.each(dwc.order[key], function (fld) {
        //     if (_.has(canonical, fld)) {
        //         if (!_.has(localRecord, key)) {
        //             localRecord[key] = [];
        //         }
        //         const datum = {};
        //         datum[fld] = canonical[fld];
        //         if (interpreted.has(fld)) {
        //             datum['interpreted'] = true
        //         }
        //         localRecord[key].push(datum);
        //         has.push(fld);
        //     }
        // });
    });

    const dif = _.difference(Object.keys(canonical), has);
    _.each(dif, function (item) {
        if (item.indexOf('idigbio:') === -1) {
            if (_.isUndefined(localRecord['other'])) {
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

