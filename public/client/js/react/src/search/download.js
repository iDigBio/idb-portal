
import React, {useEffect, useState} from 'react'
import idbapi from '../../../lib/idbapi'
var Downloads
const Download = ({searchChange, search, active, history}) => {
    const [options, setOptions] = useState([])
    function queryToSentence(query){
        var q = query;
        var parts = [], sort = '';
        if(!_.isEmpty(q.fulltext)){
            parts.push('Contains text '+q.fulltext+'.');
        }
        if(q.image){
            parts.push('Image is present.');
        }
        if(q.geopoint){
            parts.push('Geopoint is present.');
        }

        _.each(q.filters,function(filter){
            var type = filter.type, name = fields.byTerm[filter.name].name;//filter.name;
            if(filter.exists || filter.missing){
                parts.push(name + ' is '+(filter.exists ? 'present' : 'missing')+'.');
            }else if(type=='text' && !_.isEmpty(filter.text)){
                var lines = filter.text.split('\n'),words='';
                lines = _.filter(lines,function(i){
                    return !_.isEmpty(i);
                })
                if(lines.length>1){
                    words = '(' + lines.join(' or ') + ').';
                }else{
                    words = lines+'.';
                }
                parts.push(name+' = '+words);
            }else if(type=='daterange'){
                if(!_.isEmpty(filter.range.gte)){
                    parts.push(name + ' >= ' + (filter.range.gte));
                }
                if(!_.isEmpty(filter.range.lte)){
                    parts.push(name + ' <= ' + (filter.range.lte));
                }
            }else if(type=='numericrange'){
                if(filter.range.gte){
                    parts.push(name + ' >= ' + (filter.range.gte));
                }
                if(filter.range.lte){
                    parts.push(name + ' <= ' + (filter.range.lte));
                }
            }
        });

        var geobounds=[];
        if(q.mapping.type=='box'){
            var nw = q.mapping.bounds.top_left, se = q.mapping.bounds.bottom_right;
            if(nw.lat || nw.lon){
                var l = 'NW', c=[];
                if(nw.lat){
                    c.push(' lat = '+nw.lat);
                }
                if(nw.lon){
                    c.push(' lon = '+nw.lon);
                }
                l += c.join(',');
                geobounds.push(l);
            }
            if(se.lat || se.lon){
                var l = 'SE', c=[];
                if(se.lat){
                    c.push(' lat = '+se.lat);
                }
                if(se.lon){
                    c.push(' lon = '+se.lon);
                }
                l += c.join(',');
                geobounds.push(l);
            }
        }else if(q.mapping.type=='radius' && q.mapping.bounds.lat && q.mapping.bounds.lon && q.mapping.bounds.distance){
            geobounds.push('point at '+q.mapping.bounds.lat+ ', '+ q.mapping.bounds.lon + ' with a '+q.mapping.bounds.distance+'km radius');
        }

        //compile geobounds
        if(geobounds.length > 0){
            parts.push('Bounds are '+geobounds.join(' & ')+'.');
        }
        if(q.sorting.length>0){
            sort = 'Sort by';
            q.sorting.forEach(function(s){
                if(s.name){
                    sort+= ' '+fields.byTerm[s.name].name+' '+s.order;
                }
            })
            sort+='.';
        }
        if(parts.length===0){
            return 'Match all. '+ sort;
        }else{

            return parts.join(' ') + ' ' + sort;
        }
    }

    function historySelect(e){
        var val = e.currentTarget.value;
        var q = searchHistory.history[val];
        searchChange(q);
    }
    function clearHistory(){
        searchHistory.clear();
        setOptions([])
    }

    useEffect(() => {
        const newOptions = []
        searchHistory.history.forEach(function(item,ind){
            newOptions.push(
                <option key={'download-'+ind} value={ind}>{queryToSentence(item)}</option>
            )
        })
        setOptions(newOptions)
    }, [search]);

    //get count

    return (
        <div className={"clearfix section "+active} id="download">
            <div className="sub" id="current">
                <label>Current Search</label>
                <div className="input-group">
                    <select className="form-control history-select" onChange={historySelect}>
                        {options}
                    </select>
                    <a className="btn input-group-addon" title="click to clear search history" onClick={clearHistory}>
                        <i className="glyphicon glyphicon-refresh"></i>
                    </a>
                </div>
            </div>
            <Downloader search={search} queryToSentence={queryToSentence} time="calculating" />
        </div>
    )

};
Downloads = Download
const Downloader = ({search, queryToSentence}) => {
    const [time, setTime] = useState('calculating')
    const [disabled, setDisabled] = useState(false)
    const [downloads, setDownloads] = useState()
    const [downloadsTableRows, setDownloadsTableRows] = useState()

    //Initialize non-state variables
    useEffect(() => {
        var localDownloads=[];
        if(localStorage){
            if(localStorage.downloads){
                localDownloads = JSON.parse(localStorage.getItem('downloads')).downloads;
            }else{
                localStorage.setItem('downloads', JSON.stringify({downloads: localDownloads}));
            }
        }
        setDownloads(localDownloads)
        checkDownloadStatus()
    }, []); //will run on initial render only


    const checkDownloadStatus = function(){
        var update = downloads, pendings=false;
        async.each(downloads,function(item,callback){

            if(Date.now() > Date.parse(item.expires)){
                removeDownload(item);
                callback();
            }else if(item.complete === false){
                var surl = 'https://'+ url('hostname',item.status_url) + url('path',item.status_url);

                var statusFunc = function() {
                    $.getJSON(surl, {}, function(data, textStatus, jqXHR) {
                        if(data.complete) {
                            updateDownload(data);
                        }else{
                            pendings = true;
                        }
                        callback();
                    }).fail(statusFunc);
                }
                statusFunc();
            }else{
                callback();
            }
        },function(err){
            if(pendings){
                setTimeout(function(){
                    checkDownloadStatus();
                },5000)
            }
        })
    }
    checkDownloadStatus();

    useEffect(() => {
        setDownloadTime(search)
    }, [search]);

    function getId(status_url){
        var item = status_url.split('/');
        return item[item.length-1];
    }
    function getDownloadIds(){
        return _.map(downloads,function(item){
            return getId(item.status_url);
        });
    }
    function addDownload(obj,search){
        var tempDownloads = downloads;
        var ids = getDownloadIds();
        if(ids.indexOf(getId(obj.status_url))===-1){
            obj.sentence = queryToSentence(search);
            tempDownloads.unshift(obj);
            setDownloads(tempDownloads)
            if(localStorage){
                localStorage.setItem('downloads', JSON.stringify({downloads: tempDownloads}));
            }
            checkDownloadStatus();
            setDownloadsTableRows(_.map(downloads,function(item){
                var sentence = item.sentence ? item.sentence : 'no label';
                if(item.complete){

                    return (<tr key={sentence} className="dl-row" title={sentence}>
                        <td className="title">{sentence}</td>
                        <td className="status"><a href={item.download_url}>Click To Download</a></td>
                    </tr>)
                }else{
                    return (<tr key={sentence} className="dl-row" title={sentence}>
                        <td className="title">{sentence}</td>
                        <td className="status pending">pending</td>
                    </tr>)
                }
                key++;
            }))
        }
    }
    function updateDownload(obj){
        var tempDownloads = downloads;
        var ids = getDownloadIds();
        //obj.sentence = downloads[update.indexOf(obj.query_hash)]
        _.merge(downloads[ids.indexOf(getId(obj.status_url))], obj);
        setDownloads(tempDownloads)
        if(localStorage){
            localStorage.setItem('downloads',JSON.stringify({downloads: tempDownloads}));
        }
        setDownloadsTableRows(_.map(downloads,function(item){
            var sentence = item.sentence ? item.sentence : 'no label';
            if(item.complete){

                return (<tr key={sentence} className="dl-row" title={sentence}>
                    <td className="title">{sentence}</td>
                    <td className="status"><a href={item.download_url}>Click To Download</a></td>
                </tr>)
            }else{
                return (<tr key={sentence} className="dl-row" title={sentence}>
                    <td className="title">{sentence}</td>
                    <td className="status pending">pending</td>
                </tr>)
            }
            key++;
        }))
    }
    function removeDownload(obj){
        var tempDownloads = downloads;
        var ids = getDownloadIds()
        tempDownloads.splice(ids.indexOf(getId(obj.status_url)),1);
        setDownloads(tempDownloads)
        if(localStorage){
            localStorage.setItem('downloads',JSON.stringify({downloads: tempDownloads}));
        }
    }
    function setDownloadTime(search){
        idbapi.countRecords({rq: queryBuilder.buildQueryShim(search)},function(resp){
                if(resp.itemCount===0){
                    setTime('not available')
                    setDisabled(true)
                }else{
                    var localTime = Math.floor((resp.itemCount / 10000) * 7);
                    localTime = localTime < 10 ? 10 : localTime;//always lag time for download
                    var timehour = Math.floor(localTime / 3600);
                    var timemin = Math.floor(localTime / 60) % 60;
                    var timesec = (localTime % 60);
                    setTime(timehour + ' hrs '+timemin+' mins '+timesec+ ' secs')
                    setDisabled(false)
                }
            }
        )
    }
    function startDownload(){
        // var self=this;
        // self.dlstatus = true;
        var email = $('#email').val();
        var q = queryBuilder.makeDownloadQuery(search);
        if (email == "") {
            $('#download-email').addClass("invalid")
            $('#download-email').focus()
        } else {
            var req = function(){
                setTimeout(function(){
                    $.post(idbapi.media_host + "v2/download", {rq: JSON.stringify(q), email: email}, function(data, textStatus, jqXHR) {
                        addDownload(data,search);
                    }).fail(req);
                }, 1000);
            }
            req();
        }
    }

    useEffect(() => {
        var key=0;
        var updatedDownloadsTableRows = _.map(downloads,function(item){
            var sentence = item.sentence ? item.sentence : 'no label';
            if(item.complete){

                return (<tr key={sentence} className="dl-row" title={sentence}>
                    <td className="title">{sentence}</td>
                    <td className="status"><a href={item.download_url}>Click To Download</a></td>
                </tr>)
            }else{
                return (<tr key={sentence} className="dl-row" title={sentence}>
                    <td className="title">{sentence}</td>
                    <td className="status pending">pending</td>
                </tr>)
            }
            key++;
        })
        setDownloadsTableRows(updatedDownloadsTableRows)
    }, [downloads]);

    return (
        <div className="sub">
            <div id="downloader">
                <label>Download CSV</label> - <span>Build time: {time}</span>
                <div className="input-group">
                    <span className="input-group-addon">Email</span>
                    <input id="email" type="email" className="form-control email" placeholder="enter an email to download" disabled={disabled}/>
                    <a className="btn input-group-addon" onClick={startDownload} disabled={disabled} title="click to start download">
                        <i className="glyphicon glyphicon-download"></i>
                    </a>
                </div>
            </div>
            <div id="downloads-section" className="clearfix">
                <label>Downloads</label>
                <table id="download-header">
                    <thead>
                    <tr><th className="title">Search</th><th className="status">Status</th></tr>
                    </thead>
                </table>
                <table id="downloads-available">

                    {downloadsTableRows}

                </table>
            </div>
        </div>
    )

}
export default Download;