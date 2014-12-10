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
        var options = [],self=this;

        searchHistory.history.forEach(function(item,ind){
            options.push(
                <option value={ind}>{self.queryToSentence(item)}</option>
            )
        })
        return (
            <div>
                <div>
                    <label>History:</label>
                    <select className="form-control history-select" onChange={this.historySelect} value="0">
                        {options}
                    </select>
                </div>
            </div>
        )
    }
});