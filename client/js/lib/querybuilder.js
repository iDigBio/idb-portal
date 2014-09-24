// ### QueryBuilder
// module for building Elastic Search queries 
// and basic Search Object for search state
module.exports = (function(){
	var QueryBuilder = function(){  
        this.basicSearchObject = function(){
            return {"size":100,"from":0,"sortName":"scientificname","sortDir":"asc"};
        },     
        // ### buildSearchObject
        // builds a basic object containing all relevant values for a ES search
        // directly from the DOM. Used as the basic object for history.
        // Removes empty values
        this.buildSearchObject = function(){
            var search=this.basicSearchObject();
            $.each($('.search-input').serializeArray(),function(ind,obj){
                if(!_.isEmpty(obj.value)){
                    search[obj.name]=obj.value;
                }
            });
            return search;
        }
        // ### makeQuery
        // costructs an Elastic Search query from a search object
        // created with buildSearchObject
        // returns an Elastic Search JSON object.
        // #### parameters
        // 1. so: search objects 
		this.makeQuery = function(obj){
            //search
            var so = _.clone(obj);
		    var query = {
                "size": so.size,
                "from": so.from,
                "query":{},
                "sort":{},
                "aggs":{
                    "recordsets":{
                        "terms": {"field": "recordset", "size":1000}
                    }
                }
            };
            delete so.size;
            delete so.from;

            var matchAll = {
                "bool": {
                    "must": [{
                        "match_all": {}
                    }]
                }
            };

            var and = [];//main filter
            var ranges = {}; //collects various range inputs to be added to the and filter
            var geobounds = {}; //collects geobounds field values
            var fulltext = '';
            query["sort"][so["sortName"]]={"order": so["sortDir"]};
            //always sort genus and specificepithet together
            if(so["sortName"]=='specificepithet'){
                query["sort"]["genus"]={"order": so["sortDir"]};
            }else if(so["sortName"]=='genus'){
                query["sort"]["specificepithet"]={"order": so["sortDir"]};
            }
            delete so["sortName"];
            delete so["sortDir"];
            //text and checkbox values
            _.each(so,function(value,name){
                var split = name.split('-');
                if(name==='hasImage'){
                    and.push({"term":{"hasImage": true}});
                }else if(name == 'fulltext'){
                    fulltext = value;
                }else if(split.length>1){
                    var type = split[split.length-1];
                    var field = split[0];
                    if(type=='text'){
                        var lines = value.split('\n');
                        if (lines.length > 1) {
                            var terms = [];
                            for (line in lines) {
                                //use some regex here
                                //split off extra crap
                                var word=helpers.strip(lines[line]);
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
                        } else {
                            var term = {};
                            term[field] = value.toLowerCase();
                            and.push({
                                "term": term
                            });
                        } 
                    }else if(type=='checkbox'){
                        var must = {};
                        must[value]={
                            "field": field
                        }
                        and.push(must);
                    }else if(type=='range'){
                        //range is 1 or 2 values applied to one field
                        var opr = split[1];
                        if(_.isUndefined(ranges[field])){
                            ranges[field]={};
                        }
                        ranges[field][opr]=value;
                    }else if(type=='locrange'){
                        //locrange is one or two values applied to 2 fields
                        var opr = split[1];
                        var terms = fields.rangeTerms[field].termsorder;
                        _.each(terms,function(val){
                            if(_.isUndefined(ranges[val])){
                                ranges[val]={};
                            }
                            ranges[val][opr]=value;
                        });
                    }else if(type=='geobounds'){
                        var corner = split[1], dir = split[2];
                        if(_.isEmpty(geobounds)){
                            _.extend(geobounds,_.clone(fields.byTerm[field].defaults));
                        }
                        geobounds[corner][dir] = parseFloat(value);
                    }
                } 
            });
            //compile any range queries
            _.each(ranges,function(v,k){
                var range={"range":{}};
                range.range[k]=v;
                and.push(range);
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
                   _.extend(query.query.filtered , {"query": {"match": {"_all": { "query": fulltext, "operator": "and" }} }} );
                }                
            }else if(and.length == 0 && !_.isEmpty(fulltext)) {
                query.query["match"] = {
                    "_all": { 
                        "query": fulltext,
                        "operator": "and"
                    }
                };
            }else if(and.length == 0 && _.isEmpty(fulltext)) {
                query.query = matchAll;
            }

            return query;
		}
	    // ### buildAutocompleteQuery
	    // builds and returns faceted Elastic Search query based on searchObject
	    // autocomplete is progressive search using all fields with values including active field
	    // #### parameters
	    // 1. field: data field to be autocompleted 
	    this.buildAutocompleteQuery = function(field){
	        var query = {
                "facets": {},
                "from": 0,
                "size": 0,
                "query": {},
                "sort": {}
            };
            
	        query.sort[field] = {
	            "order": "asc"
	        };
	        var and = [];
            var so = this.buildSearchObject();
            var fulltext = '';
            //always sort genus and specificepithet together
            //text and checkbox values
            _.each(so,function(value,name){
                var split = name.split('-');
                if(split.length>1){
                    var type = split[split.length-1];
                    var name = split[0];
                    if(type=='text'){
                        var lines = value.split('\n');
                        if (lines.length > 1 && name !== field) {
                            var terms = [];
                            for (line in lines) {
                                //split off extra crap
                                var word=helpers.strip(lines[line]).toLowerCase();
                                terms.push(word);
                            }
                            var term = {
                                "execution": "or"
                            };
                            term[field] = terms;
                            //or.or.push({"terms": term}); 
                            and.push({
                                "terms": term
                            });
                        }else{
                            var term = {};
                            term[name] = lines[lines.length-1].toLowerCase();
                            if(field===name){
                                if(fields.byTerm[name]['tokenized'] === 1){
                                    and.push({
                                        "term": term
                                    }); 
                                    query["facets"]["static_" + name] = {
                                        terms: {
                                            field: name,
                                            regex: "..+",
                                            order: "term",
                                            size: 15
                                        }
                                    }
                                }else{
                                    and.push({
                                        prefix: term
                                    });     
                                    query["facets"]["static_" + name] = {
                                        terms: {
                                            field: name,
                                            regex: "..+",
                                            order: "term",
                                            size: 15
                                        }
                                    }               
                                }
                            }else{
                                and.push({
                                    "term": term
                                });                                
                            }
                        } 
                    }else if(type=='checkbox'){
                        var must = {};
                        must[value] = {
                            field: name
                        };
                        and.push(must);
                    }
                } 
            });  
            if(and.length>0){
                query.query.filtered = {
                    query: {match_all: {}},
                    filter: {}
                };
                query.query.filtered.filter.and = and;               
            }  
            return query;
	    }
    
        // ### buildCSVQuery
        // builds and returns CSV query for pgsql table csv system based on search object.
        // #### Parameters
        // 1. query: search object
        this.buildCSVQuery = function(query){
            var q = _.clone(query);
            delete q.sortName;
            delete q.sortDir;

            var csvquery = {};
            if(_.has(q,'fulltext')){
                csvquery.data = {type: 'fulltext', value: q.fulltext}
                delete q.fulltext;
            }
            if(_.has(q,'hasImage')){
                csvquery['hasImage']=true;
                delete q.hasImage;
            }

            _.each(q,function(val,key){
                var split = key.split('-');
                var term = split[0];
                if(split.length>1){
                    var type = split[split.length-1];
                    if(type=='text'){
                        var lines = val.split('\n');
                        if(lines.length>1){
                            var trms = [];
                            lines.forEach(function(item){
                                trms.push(helpers.strip(item).toLowerCase());
                            });
                            csvquery[term]= trms;
                        }else{
                            csvquery[term]=val.toLowerCase();
                        }
                    }else if(type=='checkbox'){
                        csvquery[term]={type: val};
                    }else if(type=='range'){
                        var opr=split[1];
                        if(_.isUndefined(csvquery[term])){
                            csvquery[term]={type:'range'};
                        }
                        csvquery[term][opr]=val;                    
                    }else if(type=='locrange'){
                        var opr=split[1];
                        _.each(fields.rangeTerms[term].termsorder,function(trm){
                            if(_.isUndefined(csvquery[trm])){
                                csvquery[trm]={type:'range'};
                            }
                            csvquery[trm][opr]=val;    
                        });
                    }else if(type=='geobounds'){
                        var corner=split[1],dir=split[2];
                        if(_.isUndefined(csvquery.geopoint)){
                            var def = _.clone(fields.byTerm['geopoint'].defaults);
                            csvquery.geopoint={type: 'geo_bounding_box',top_left: def.top_left, bottom_right: def.bottom_right};
                        }
                        csvquery.geopoint[corner][dir]=parseFloat(val);
                    }
                }
            });

            return csvquery;
        }

	}
	return new QueryBuilder;
})();