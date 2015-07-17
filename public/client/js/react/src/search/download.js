
var React = require('react');
var idbapi = require('../../../lib/idbapi');

var Downloads = module.exports = React.createClass({
    statics: {
        queryToSentence: function(query){
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
    },

    historySelect: function(e){
        var val = e.currentTarget.value;
        var q = searchHistory.history[val];
        this.props.searchChange(q);
    },
    clearHistory: function(){
        searchHistory.clear();
        this.forceUpdate();
    },
    render: function(){
        var options = [],self=this, time='';

        //get count 
        searchHistory.history.forEach(function(item,ind){
            options.push(
                <option key={'download-'+ind} value={ind}>{Downloads.queryToSentence(item)}</option>
            )
        })
        return (
            <div className={"clearfix section "+this.props.active} id="download">
                <div className="sub" id="current">
                    <label>Current Search</label>
                    <div className="input-group">
                        <select className="form-control history-select"  onChange={this.historySelect} value="0">
                            {options}
                        </select>
                        <a className="btn input-group-addon" title="click to clear search history" onClick={this.clearHistory}>
                            <i className="glyphicon glyphicon-refresh"></i>
                        </a>
                    </div>
                </div>
                <Downloader search={this.props.search} time="calculating" />
            </div>
        )
    }
});

var Downloader = React.createClass({
    getInitialState: function(){
        var downloads=[];
        if(localStorage){
            if(localStorage.downloads){
                downloads = JSON.parse(localStorage.getItem('downloads')).downloads;
            }else{
                localStorage.setItem('downloads', JSON.stringify({downloads: downloads}));
            }
            this.setState({downloads: downloads});
        }
        return {time: 'calculating', disabled: false, downloads: downloads};
    },
    componentWillMount: function(){

        var self=this;

        this.checkDownloadStatus = function(){

            var update = self.state.downloads, pendings=false;
            async.each(self.state.downloads,function(item,callback){
              
                if(Date.now() > Date.parse(item.expires)){
                    self.removeDownload(item);
                    callback();
                }else if(item.complete === false){
                    var surl = 'https://'+ url('hostname',item.status_url) + url('path',item.status_url);
                    
                    var statusFunc = function() {
                        $.getJSON(surl, {}, function(data, textStatus, jqXHR) {
                            if(data.complete) {
                                self.updateDownload(data);
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
                        self.checkDownloadStatus();
                    },5000)
                }
            })
        }   
    },
    componentDidMount: function(){
        this.setDownloadTime(this.props.search);
        this.checkDownloadStatus();
    },
    componentWillReceiveProps: function(nextProps){
        this.setDownloadTime(nextProps.search);
    },
    getId: function(status_url){
        var item = status_url.split('/');
        return item[item.length-1];
    },
    getDownloadIds: function(){
        var self = this;
        return _.map(this.state.downloads,function(item){
            return self.getId(item.status_url);
        });
    },
    addDownload: function(obj,search){
        var downloads = this.state.downloads;
        var ids = this.getDownloadIds();
        if(ids.indexOf(this.getId(obj.status_url))===-1){
            obj.sentence = Downloads.queryToSentence(search);
            downloads.unshift(obj);
            this.setState({downloads: downloads});
            if(localStorage){
                localStorage.setItem('downloads', JSON.stringify({downloads: downloads}));
            }
            this.checkDownloadStatus();            
        }
    },
    updateDownload: function(obj){
        var downloads = this.state.downloads;
        var ids = this.getDownloadIds();
        //obj.sentence = downloads[update.indexOf(obj.query_hash)]
        _.merge(downloads[ids.indexOf(this.getId(obj.status_url))],obj);
        this.setState({downloads: downloads});
        if(localStorage){
            localStorage.setItem('downloads',JSON.stringify({downloads: downloads}));
        }
        //this.checkDownloadStatus();         
    },
    removeDownload: function(obj){
        var downloads = this.state.downloads;
        var ids = this.getDownloadIds()
        downloads.splice(ids.indexOf(this.getId(obj.status_url)),1);
        this.setState({downloads: downloads});
        if(localStorage){
            localStorage.setItem('downloads',JSON.stringify({downloads: downloads}));
        }
    },
    setDownloadTime: function(search){
        var self=this;
        idbapi.countRecords({rq: queryBuilder.buildQueryShim(search)},function(resp){
                var state;
                if(resp.itemCount===0){
                    state = {time: 'not available', disabled: true};
                }else{
                    var time = Math.floor((resp.itemCount / 10000) * 7);
                    time = time < 10 ? 10 : time;//always lag time for download
                    var timehour = Math.floor(time / 3600);
                    var timemin = Math.floor(time / 60) % 60;
                    var timesec = (time % 60);
                    state = {time: timehour + ' hrs '+timemin+' mins '+timesec+ ' secs', disabled: false};
                }
                self.setState(state);      
            }
        )
    },
    startDownload: function(){
        var self=this;
        self.dlstatus = true;
        var email = $('#email').val();
        var q = queryBuilder.makeDownloadQuery(this.props.search);
        if (email == "") {
            $('#download-email').addClass("invalid")
            $('#download-email').focus()
        } else {
            //this.setState('disabled', true);
            var req = function(){
                setTimeout(function(){
                    /*$.ajax({
                        type: "POST",
                        url: "https://beta-api.idigbio.org/v2/download",
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({rq: q, email: email}),
                        success: function(data, textStatus, jqXHR) {
                            self.addDownload(data,self.props.search);
                        }
                    }).fail(req);
                    */
                    $.post("https://api.idigbio.org/v2/download", {rq: JSON.stringify(q), email: email}, function(data, textStatus, jqXHR) {
                        self.addDownload(data,self.props.search);
                    }).fail(req);
                }, 1000);           
            }
            req();
        }        
    },
    render: function(){
        var key=0;
        var downloads = _.map(this.state.downloads,function(item){
            var sentence = item.sentence ? item.sentence : 'no label';
            if(item.complete){

                return <tr key={sentence} className="dl-row" title={sentence}>
                         <td className="title">{sentence}</td>
                         <td className="status"><a href={item.download_url}>Click To Download</a></td>
                      </tr>
            }else{
                return <tr key={sentence} className="dl-row" title={sentence}>
                        <td className="title">{sentence}</td>
                        <td className="status pending">pending</td>
                    </tr>
            }
            key++;
        })

        return (
            <div className="sub">
                <div id="downloader">
                    <label>Download CSV</label> - <span>Build time: {this.state.time}</span>
                    <div className="input-group">
                        <span className="input-group-addon">Email</span>
                        <input id="email" type="email" className="form-control email" placeholder="enter an email to download" disabled={this.state.disabled}/>
                        <a className="btn input-group-addon" onClick={this.startDownload} disabled={this.state.disabled} title="click to start download">
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
                       
                            {downloads}
                      
                    </table>
                </div>
            </div>
        )
    }
})