module.exports = function(search){
        var rq = JSON.parse(decodeURIComponent(url('?rq')));
        
        var filters=[],filter;
        _.forOwn(rq,function(v,k){
            
            if(k==='data'){
                if(_.isObject(v) && _.isString(v.type) && v.type === 'fulltext'){
                    search.fulltext = v.value;
                }
            }else if(k==='hasImage' && _.isBoolean(v)){
                search.image = v;
            }else if(k==='geopoint' && _.isObject(v)){
                if(v.type === 'geo_bounding_box'){
                    delete v.type
                    _.assign(search.bounds, v);
                }else if(v.type === 'exists' || v.type === 'missing'){
                    search.geopoint = v.type === 'exists' ? true : false;
                }
            }else if(_.isObject(fields.byTerm[k])){
                filter = Filters.newFilterProps(k);
                debugger
                if(_.isObject(v) && _.isString(v.type)){
                    debugger
                    if(v.type === 'exists' || v.type === 'missing'){
                        filter[v.type] = true;
                    }else if(v.type === 'range'){
                        
                        delete v.type;
                        _.assign(filter.range,v);
                    }
                }else if(_.isString(v)){
                    filter.text = v;
                }else if(_.isArray(v)){
                    filter.text = v.join('\n');
                }
                filters.push(filter);                   
            }
        })
        if(filters.length > 0){
            search.filters = filters;
        }    
}
