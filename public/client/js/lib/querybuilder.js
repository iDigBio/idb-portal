// ### QueryBuilder
// module for building Elastic Search queries 
// and basic Search Object for search state
var fields = require('./fields');

module.exports = (function(){
	var QueryBuilder = function(){  

        // ### makeQuery
        // costructs an Elastic Search query from a search object
        // created with buildSearchObject
        // returns an Elastic Search JSON object.
        // #### parameters
        // 1. so: search objects 
		this.makeQuery = function(search){
		    var query = {
                "size": search.size,
                "from": search.from,
                "query":{},
                "sort":[{"scientificname":{"order":"asc"}}],
                "aggs":{
                    "recordsets":{
                        "terms": {"field": "recordset", "size":1000}
                    }
                }
            };

            var matchAll = {
                "bool": {
                    "must": [{
                        "match_all": {}
                    }]
                }
            };

            var and = [];//main filter
            var ranges = {}; //collects various range inputs to be added to the and filter
            
            var fulltext = helpers.strip(search.fulltext);
            /*query["sort"][so["sortName"]]={"order": so["sortDir"]};
            //always sort genus and specificepithet together
            if(so["sortName"]=='specificepithet'){
                query["sort"]["genus"]={"order": so["sortDir"]};
            }else if(so["sortName"]=='genus'){
                query["sort"]["specificepithet"]={"order": so["sortDir"]};
            }*/
            var sort=[];
            search.sorting.forEach(function(item){
                var s={}
          
                if(!_.isEmpty(item.name)){
                    s[item.name] = item.order;
                }
                sort.push(s);
            });
            if(!_.isEmpty(sort)){
                query.sort = sort;
            }
            if(search.image){
                and.push({"term":{"hasImage": true}});
            }
            if(search.geopoint){
                and.push({"exists":{"field":"geopoint"}});
            }
            search.filters.forEach(function(filter){
                
                var field = filter.name;//fields.byName[filter.name].term;
                if(filter.exists || filter.missing){
                    var must = {}, value = filter.exists ? "exists" : "missing";
                    must[value]={
                        "field": field
                    }
                    and.push(must);
                }else if (filter.type==='text'){
                    var lines = filter.text.split('\n');
                    if(lines.length > 1) {
                        var terms = [];
                        for (line in lines) {
                            //use some regex here
                            //split off extra crap
                            var word=lines[line];//helpers.strip(lines[line]);
                            terms.push(word.toLowerCase());
                        }
                        var term = {
                            "execution": "or"
                        };
                        term[field] = terms;
                        //or.or.push({"terms": term}); 
                        and.push({
                            "terms": term
                        });
                    }else if(!_.isEmpty(filter.text)){
                        var term = {};
                        term[field] = filter.text.toLowerCase();
                        and.push({
                            "term": term
                        });
                    }
                }else if(filter.type==='daterange'){
                    var reg = /\d{4}-\d{1,2}-\d{1,2}/, range={};
                    range[field]={};

                    if(reg.test(filter.range.gte)){
                        range[field]['gte']=filter.range.gte;
                    }
                    if(reg.test(filter.range.lte)){
                        range[field]['lte']=filter.range.lte;
                    }
                    if(!_.isEmpty(range[field])){
                        and.push({
                            'range': range
                        })
                    }
                }else if(filter.type==='numericrange'){
                    var range={};
                    range[field]={};
                    if(filter.range.gte){
                        range[field]['gte']=parseFloat(filter.range.gte);
                    }
                    if(filter.range.lte){
                        range[field]['lte']=parseFloat(filter.range.lte);
                    }
                    if(!_.isEmpty(range[field])){
                        and.push({
                            'range': range
                        })
                    }
                }                
            })

            var geobounds = {}; //collects geobounds field values
            _.each(search.bounds,function(val,key){
                _.each(val, function(v,k){
                    if(v && _.isEmpty(geobounds)){
                        geobounds={
                            top_left:{
                                lat: 89.99999,
                                lon: -180.0
                            },
                            bottom_right:{
                                lat: -90.0,
                                lon: 179.99999
                            }
                        }
                    }
                    if(v){
                        geobounds[key][k]=parseFloat(v);
                    }
                })
            });
            //compile geobounds query
            if(!_.isEmpty(geobounds)){
                if(geobounds.top_left.lat>89.99999){
                    geobounds.top_left.lat=89.99999;
                }
                if(geobounds.bottom_right.lon>179.99999){
                    geobounds.bottom_right.lon=179.99999;
                }
                var bounds = {"geo_bounding_box": {
                        "geopoint": geobounds
                    }
                }
                and.push(bounds);
            }

            if(and.length > 0){
                _.extend(query.query, {"filtered": {"filter": {}}} );
                query.query.filtered.filter.and = and; 
                if (!_.isEmpty(fulltext)) {
                   _.extend(query.query.filtered , {"query": {"match": {"_all": { "query": fulltext.toLowerCase(), "operator": "and" }} }} );
                }                
            }else if(and.length == 0 && !_.isEmpty(fulltext)) {
                query.query["match"] = {
                    "_all": { 
                        "query": fulltext.toLowerCase(),
                        "operator": "and"
                    }
                };
            }else if(and.length == 0 && _.isEmpty(fulltext)) {
                query.query = matchAll;
            }

            return query;
		}

        this.makeIDBQuery = function(search){
            var idbq = {}, reg = /\d{4}-\d{1,2}-\d{1,2}/;
            search.filters.forEach(function(item){
                var term = item.name;//fields.byName[item.name].term;
                if(item.exists){
                    idbq[term]={'type': 'exists'};
                }else if(item.missing){
                    idbq[term]={'type': 'missing'};
                }else if(item.text && !_.isEmpty(item.text)){
                    var text = item.text.split('\n');
                    if(text.length>1){
                        idbq[term] = text;
                    }else{
                        idbq[term] = text[0];
                    }
                }else if(item.range && (!_.isEmpty(item.range.gte) || !_.isEmpty(item.range.lte))){
                    idbq[term]={'type':'range'};
                    if(item.type=='daterange'){
                        if(reg.test(item.range.gte)){
                            idbq[term]['gte'] = item.range.gte;
                        }
                        if(reg.test(item.range.lte)){
                            idbq[term]['lte'] = item.range.lte;
                        }                        
                    }else if(item.type=='numericrange'){
                        if(item.range.gte){
                            idbq[term]['gte'] = item.range.gte;
                        }
                        if(item.range.lte){
                            idbq[term]['lte'] = item.range.lte;
                        }  
                    }
                }
            })
            var geobounds = {}; //collects geobounds field values
            _.each(search.bounds,function(val,key){
                _.each(val, function(v,k){
                    if(v && _.isEmpty(geobounds)){
                        geobounds={
                            type: "geo_bounding_box",
                            top_left:{
                                lat: 89.99999,
                                lon: -180.0
                            },
                            bottom_right:{
                                lat: -90.0,
                                lon: 179.99999
                            }
                        }
                    }
                    if(v){
                        geobounds[key][k]=parseFloat(v);
                    }
                })
            });
            if(!_.isEmpty(geobounds)){
                idbq['geopoint'] = geobounds;
            }else if(search.geopoint){
                idbq['geopoint']={'type': 'exists'};
            }
            if(search.image){
                idbq['hasImage']=true;
            }
            return idbq;
        }

	}
	return new QueryBuilder;
})();