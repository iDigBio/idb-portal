// ### QueryBuilder
// module for building API queries from Search State object

var fields = require('./fields');

module.exports = (function(){
	var QueryBuilder = function(){  

        // ### makeQuery DEPRECATED IN FAVOR OF API
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
            var sort=[];
            search.sorting.forEach(function(item){
                var s={}
                if(!_.isEmpty(item.name)){
                    s[item.name] = item.order;
                    sort.push(s);
                }
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
                    var lines = helpers.strip(filter.text).split('\n');
                    if(lines.length > 1) {
                        var terms = [];
                        for (line in lines) {
                            //use some regex here
                            //split off extra crap
                            var word=lines[line];//helpers.strip(lines[line]);
                            if(!_.isEmpty(helpers.strip(word))){
                                terms.push(word.toLowerCase());
                            }
                        }
                        var term = {
                            "execution": "or"
                        };
                        term[field] = terms;
                        //or.or.push({"terms": term}); 
                        if(terms.length>0){
                            and.push({
                                "terms": term
                            });
                        }
                    }else if(!_.isEmpty(helpers.strip(filter.text))){
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
            switch(search.mapping.type){
                case 'box':
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
                    break;

                case 'radius':

                    break;
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


        this.buildQueryShim = function(search){
            var idbq = {}, reg = /\d{4}-\d{1,2}-\d{1,2}/;
            if(!_.isEmpty(search.fulltext)){
                idbq["data"]={
                    "type":"fulltext",
                    "value": search.fulltext
                }
            }

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
                }else if(item.range && ( item.range.gte || item.range.lte )){
                    
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

            switch(search.mapping.type){
                case 'box':
                    _.each(search.mapping.bounds,function(val,key){
                        _.each(val, function(v,k){
                            if(v && _.isEmpty(geobounds)){
                                geobounds={
                                    type: "geo_bounding_box",
                                    top_left:{
                                        lat: 89.99999,
                                        lon: -179.99999
                                    },
                                    bottom_right:{
                                        lat: -89.99999,
                                        lon: 179.99999
                                    }
                                }
                            }
                            if(v){
                                geobounds[key][k]=parseFloat(v);
                            }
                        })
                    });
                    break;

                case 'radius':
                    var b = search.mapping.bounds
                 
                    if(b.distance && b.lat && b.lon){
                        geobounds.type = 'geo_distance';
                        geobounds.distance = b.distance+'km';
                        geobounds.lat = parseFloat(b.lat);
                        geobounds.lon = parseFloat(b.lon);
                    }
                    break; 
            }

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

        this.makeDownloadQuery = function(search){
            return this.buildQueryShim(search);
        };

        this.makeSearchQuery = function(search){
            var params = {};
            params["rq"] = this.buildQueryShim(search);
            var sort=[];
            search.sorting.forEach(function(item){
                if(!_.isEmpty(item.name)){
                    var s = {};                
                    s[item.name] = item.order;
                    sort.push(s);
                }
            });
            if(!_.isEmpty(sort)){
                params["sort"] = sort;
            }
            params["limit"]=search.size;
            params["offset"]=search.from;

            return params;
        }



	}
	return new QueryBuilder;
})();