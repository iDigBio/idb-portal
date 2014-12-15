/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({
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
            var type = filter.type, name = filter.name;
            if(filter.exists || filter.missing){
                parts.push(name + ' is '+(filter.exists ? 'present' : 'missing')+'.');
            }else if(type=='text' && !_.isEmpty(filter.text.content)){
                var lines = filter.text.content.split('\n'),words='';
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
        var nw = q.bounds.top_left, se = q.bounds.bottom_right;
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
    },

    historySelect: function(e){
        var val = e.currentTarget.value;
        var q = searchHistory.history[val];
        this.props.searchChange(q);
    },

    render: function(){
        var options = [],self=this, time='';

        //get count 

        searchHistory.history.forEach(function(item,ind){
            options.push(
                <option value={ind}>{self.queryToSentence(item)}</option>
            )
        })
        return (
            <div className="clearfix section active" id="download">
                <div className="sub">
                    <label>Current Search</label>
                    <select className="form-control history-select" onChange={this.historySelect} value="0">
                        {options}
                    </select>
                </div>
                <Downloader search={this.props.search} time="calculating" />
            </div>
        )
    }
});

var Downloader = React.createClass({
    getInitialState: function(){
        var downloads;
        if(localStorage){
            if(localStorage.downloads){
                downloads = JSON.parse(localStorage.getItem('downloads')).downloads;
            }else{
                localStorage.setItem('downloads', JSON.stringify({downloads: []}));
                downloads = [];
            }
            this.setState({downloads: downloads});
        }
        return {time: 'calculating', disabled: false, downloads: downloads};
    },
    componentWillMount: function(){

        var self=this;

        this.checkDownloadStatus = function(){
            var downloads = _.map(self.state.downloads,function(item){
                return item.query_hash;
            });
            var update = self.state.downloads, pendings=false;
            async.each(self.state.downloads,function(item,callback){
                if(item.complete === false){
                    var surl = '//'+ url('hostname',item.status_url) + url('path',item.status_url);
                    
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
    addDownload: function(obj){
        var downloads = this.state.downloads;
        downloads.unshift(obj);
        this.setState({downloads: downloads});
        if(localStorage){
            localStorage.setItem('downloads',JSON.stringify({downloads: downloads}));
        }
        this.checkDownloadStatus();
    },
    updateDownload: function(obj){
        var downloads = this.state.downloads;
        var update = _.map(downloads, function(item){
            return item.query_hash;
        })
        downloads[update.indexOf(obj.query_hash)]=obj;
        this.setState({downloads: downloads});
        if(localStorage){
            localStorage.setItem('downloads',JSON.stringify({downloads: downloads}));
        }
        this.checkDownloadStatus();         
    },
    setDownloadTime: function(search){
        var self=this;
        //debugger
        var q = queryBuilder.makeQuery(search);
        $.post('//search.idigbio.org/idigbio/records/_count',JSON.stringify({query: q.query}),function(resp){
                var state;
                if(resp.count===0){
                    state = {time: 'not available', disabled: true};
                }else{
                    var time = Math.floor((resp.count / 10000) * 7);
                    time = time < 10 ? 10 : time;//always lag time for download
                    var timehour = Math.floor(time / 3600);
                    var timemin = Math.floor(time / 60) % 60;
                    var timesec = (time % 60);
                    state = {time: timehour + ':'+timemin+':'+timesec, disabled: false};
                }
                self.setState(state);      
            }
        )
    },
    startDownload: function(){
        var self=this;
        self.dlstatus = true;
        var email = $('#email').val();
        var q = queryBuilder.makeIDBQuery(this.props.search);
        if (email == "") {
            $('#download-email').addClass("invalid")
            $('#download-email').focus()
        } else {
            //this.setState('disabled', true);
            var req = function(){
                $.post("//csv.idigbio.org", {query: JSON.stringify(q), email: email}, function(data, textStatus, jqXHR) {
                    
                    self.addDownload(data);
                    /*var surl = '//'+ url('hostname',data.status_url) + url('path',data.status_url);
                    
                    var statusFunc = function() {
                        $.getJSON(surl, {}, function(data, textStatus, jqXHR) {
                            debugger
                            if(data.complete && data.task_status == "SUCCESS") {
                                $("#time-estimate").html("<a href='" + data.download_url + "'>Ready, Click to Download</a>");
                                self.dlstatus = false;
                            } else {
                                if(self.dlstatus===true){
                                    setTimeout(statusFunc, 5000);
                                }
                            }
                        }).fail(statusFunc);
                    }
                    setTimeout(statusFunc, 5000);*/
                }).fail(req);                   
            }
            req();
        }        
    },
    render: function(){
      
        var downloads = _.map(this.state.downloads,function(item){

            if(item.complete){

                return <li>
                        Complete:
                        <a href={item.download_url}>Click To Download</a>
                      </li>
            }else{
                return <li>
                        Pending:
                        </li>
            }
        })

        return (
            <div className="sub">
                <label>Download Results CSV</label> - <span>Approx. time: {this.state.time}</span>
                <div className="input-group">
                    <span className="input-group-addon">Email</span>
                    <input id="email" type="email" className="form-control email" placeholder="enter an email to download" disabled={this.state.disabled}/>
                    <a className="btn input-group-addon" onClick={this.startDownload} disabled={this.state.disabled} title="click to start download">
                        <i className="glyphicon glyphicon-download"></i>
                    </a>
                </div>
                <ul id="downloads-available">
                    {downloads}
                </ul>
            </div>
        )
    }
})