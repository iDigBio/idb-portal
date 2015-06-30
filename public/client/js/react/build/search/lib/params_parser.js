/*
* Params Parser module: mutates a search state object to contain get params values
* Supports iDigBio API params  (rq,sort) 
*
****/
var Filters = require('../filters');

module.exports = function(search){
    if(url('?rq')){
        try{
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
                    if(_.isObject(v) && _.isString(v.type)){
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
                    filters.unshift(filter);                   
                }
            });
            if(filters.length > 0){
                search.filters = filters;
            }  
        }catch(e){
            //fail parsing silently
        }        
    }
    if(url('?sort')){
        try{
            var sort = JSON.parse(decodeURIComponent(url('?sort')));
            if(_.isString(sort) && _.isObject(fields.byTerm[sort])){
                search.sorting = [{name: sort, order: 'asc'}];
            }else if(_.isArray(sort) && _.isObject(sort[0])){
                var s=[];
                sort.forEach(function(item){
                    _.forOwn(item,function(v,k){
                        s.push({name: k, order: v})
                    });
                });
                search.sorting = s;
            }
        }catch(e){
            //fail parsing silently
        }
    }
}
