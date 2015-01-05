/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = Downloads = React.createClass({displayName: 'Downloads',
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
                React.DOM.option({value: ind}, Downloads.queryToSentence(item))
            )
        })
        return (
            React.DOM.div({className: "clearfix section "+this.props.active, id: "download"}, 
                React.DOM.div({className: "sub", id: "current"}, 
                    React.DOM.label(null, "Current Search"), 
                    React.DOM.select({className: "form-control history-select", onChange: this.historySelect, value: "0"}, 
                        options
                    )
                ), 
                Downloader({search: this.props.search, time: "calculating"})
            )
        )
    }
});

var Downloader = React.createClass({displayName: 'Downloader',
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
            var downloads = _.map(self.state.downloads,function(item){
                return item.query_hash;
            });
            var update = self.state.downloads, pendings=false;
            async.each(self.state.downloads,function(item,callback){
              
                if(Date.now() > Date.parse(item.expires)){
                    self.removeDownload(item);
                    callback();
                }else if(item.complete === false){
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
    addDownload: function(obj,search){
        var downloads = this.state.downloads;
        var ids = _.map(downloads, function(item){
            return item.query_hash;
        })
        if(ids.indexOf(obj.query_hash)===-1){
            obj.sentence = Downloads.queryToSentence(search);
            downloads.unshift(obj);
            this.setState({downloads: downloads});
            if(localStorage){
                localStorage.setItem('downloads',JSON.stringify({downloads: downloads}));
            }
            this.checkDownloadStatus();            
        }
    },
    updateDownload: function(obj){
        var downloads = this.state.downloads;
        var update = _.map(downloads, function(item){
            return item.query_hash;
        })
        //obj.sentence = downloads[update.indexOf(obj.query_hash)]
        _.merge(downloads[update.indexOf(obj.query_hash)],obj)
        this.setState({downloads: downloads});
        if(localStorage){
            localStorage.setItem('downloads',JSON.stringify({downloads: downloads}));
        }
        //this.checkDownloadStatus();         
    },
    removeDownload: function(obj){
        var downloads = this.state.downloads;
        var ids = _.map(downloads, function(item){
            return item.query_hash;
        })
        downloads.splice(ids.indexOf(obj.query_hash),1);
        this.setState({downloads: downloads});
        if(localStorage){
            localStorage.setItem('downloads',JSON.stringify({downloads: downloads}));
        }
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
                    
                    self.addDownload(data,self.props.search);
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
            var sentence = item.sentence ? item.sentence : 'no label';
            if(item.complete){

                return React.DOM.tr({className: "dl-row", title: sentence}, 
                         React.DOM.td({className: "title"}, sentence), 
                         React.DOM.td({className: "status"}, React.DOM.a({href: item.download_url}, "Click To Download"))
                      )
            }else{
                return React.DOM.tr({className: "dl-row", title: sentence}, 
                        React.DOM.td({className: "title"}, sentence), 
                        React.DOM.td({className: "status pending"}, "pending")
                    )
            }
        })

        return (
            React.DOM.div({className: "sub"}, 
                React.DOM.div({id: "downloader"}, 
                    React.DOM.label(null, "Download CSV"), " - ", React.DOM.span(null, "Approx. time: ", this.state.time), 
                    React.DOM.div({className: "input-group"}, 
                        React.DOM.span({className: "input-group-addon"}, "Email"), 
                        React.DOM.input({id: "email", type: "email", className: "form-control email", placeholder: "enter an email to download", disabled: this.state.disabled}), 
                        React.DOM.a({className: "btn input-group-addon", onClick: this.startDownload, disabled: this.state.disabled, title: "click to start download"}, 
                            React.DOM.i({className: "glyphicon glyphicon-download"})
                        )
                    )
                ), 
                React.DOM.div({id: "downloads-section", className: "clearfix"}, 
                    React.DOM.label(null, "Available Downloads"), 
                    React.DOM.table({id: "downloads-available"}, 
                        React.DOM.thead(null, 
                            React.DOM.tr(null, React.DOM.th({className: "title"}, "Search"), React.DOM.th({className: "status"}, "Status"))
                        ), 
                        React.DOM.tbody(null, 
                            downloads
                        )
                    )
                )
            )
        )
    }
})