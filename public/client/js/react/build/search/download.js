/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({displayName: 'exports',
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
                React.DOM.option({value: ind}, self.queryToSentence(item))
            )
        })
        return (
            React.DOM.div(null, 
                React.DOM.div({className: "sub"}, 
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
        return {time: 'calculating', disabled: false}
    },
    componentDidMount: function(){
        this.getDownloadTime(this.props.search);
    },
    componentWillReceiveProps: function(nextProps){
        this.getDownloadTime(nextProps.search);
    },
    getDownloadTime: function(search){
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
                self.setState(state,function(){
                    self.forceUpdate();
                });      
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
            $('#download-button').attr("disabled", "disabled");
            $('#time-estimate img').show();
            var req = function(){
                $.post("//csv.idigbio.org", {query: JSON.stringify(q), email: email}, function(data, textStatus, jqXHR) {
                    var surl = '//'+ url('hostname',data.status_url) + url('path',data.status_url);
                    var statusFunc = function() {
                        $.getJSON(surl, {}, function(data, textStatus, jqXHR) {
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
                    setTimeout(statusFunc, 5000);
                }).fail(req);                   
            }
            req();
        }        
    },
    render: function(){
      
        return (
            React.DOM.div({className: "sub"}, 
                React.DOM.label(null, "Download Current Result Set"), 
                React.DOM.div({className: "input-group"}, 
                    React.DOM.span({className: "input-group-addon"}, "Email:"), 
                    React.DOM.input({id: "email", type: "email", className: "form-control email", placeholder: "enter an email to download", disabled: this.state.disabled}), 
                    React.DOM.a({className: "btn input-group-addon", onClick: this.startDownload, disabled: this.state.disabled, title: "click to start download"}, 
                        React.DOM.i({className: "glyphicon glyphicon-download"})
                    )
                ), 
                React.DOM.span(null, "Approx. generation time: ", this.state.time)
            )
        )
    }
})