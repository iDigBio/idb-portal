/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({
    queryToSentence: function(query){
        var q = _.clone(query);
        var parts = [], sort = '';
        if(!_.isEmpty('fulltext')){
            parts.push('Contains text '+q.fulltext+'.');
        }
        if(q.image){
            parts.push('Has image = true.');
        }

        var ranges={},geobounds=[];
        _.each(q.filters,function(filter){
                var type = filter.type, name = filter.name;
                if(filter.exists || filter.missing){
                    parts.push(name + ' '+(filter.exists ? filter.exists : filter.missing)+'.');
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
        if(filter.bounds.top_left && filter.bounds.bottom_right){
            var corner= (split[1] == 'top_left' ? 'NW' : 'SE');
            var dir= (split[2] == 'lon' ? 'longitude' : 'latitude');
            geobounds.push(corner+' '+dir+ ' = '+val);
        }
                
        //compile any range values
        _.each(ranges,function(v,k){
            parts.push(k + ' is '+v.join(' & ')+'.');
        });
        //compile geobounds
        if(geobounds.length > 0){
            parts.push('Geo bounds are '+geobounds.join(' & ')+'.');
        }
        if(q.sorting.length>0){
            sort = 'Sort by '+ fields.byTerm[q.sortName].name+ ' '+q.sortDir+'.';
        }
        if(parts.length===0){
            return 'Match all. '+ sort;
        }else{
            return parts.join(' ') + ' ' + sort;  
        }
    },
    render: function(){
        var options = [];

        searchHistory.history.forEach(function(item,ind){
            options.push(
                <option value={ind}>{JSON.stringify(item)}</option>
            )
        })
        return (
            <div>
                <div>
                    <select className="form-field">
                        {options}
                    </select>
                </div>
            </div>
        )
    }
});