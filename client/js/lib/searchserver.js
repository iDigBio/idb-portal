/*
*Search Server: module for running Elastic Search queries.
****/
module.exports = (function(){
    if(typeof window.searchServer == 'undefined'){
        window.searchServer = {port: 443, host: 'search.idigbio.org', index: 'idigbio'};
    }

    _.extend(window.searchServer, {
        // searchServer and searchIndex globals are rendered from Node config. 
        server: ((searchServer['port'] == 443 || searchServer['port'] == '443') ? 'https://' : 'http://') + searchServer['host'],
        // ### esBasic
        // makes a request to elastic search server
        // can be called as esBasic(method,path,obj,callback) or esBasic(method,path,callback)
        // #### Parameters
        // 1. method: string representing HTTP method.
        // 2. path: string representing full path with index and type or whatever ES accepts
        // 3. obj (optional): represents request parameters in basic js obj format or string of query params
        // 4. callback (optional): function for handeling response. Failed request passes 'error' to this function
        esBasic: function(method,path,obj,callback){
            var callpath = this.server+path;
            var req = {
                type: method,
                url: callpath,
                dataType: 'json'
            }
            if(_.isFunction(obj)){
                req.success = obj;
            }else if(_.isObject(obj) || _.isString(obj)){
                if(method.toLowerCase()==='get'){
                    req.data = obj;
                }else{
                    req.data = JSON.stringify(obj); 
                }
                if(_.isFunction(callback)){
                    req.success = callback;
                }
            }
            //steam roll error differentiation :)
            $.ajax(req).fail(function(){
                if(_.has(req,'success')){
                    req.success('error');
                }
            });            
        },
        // ### esIndexQuery
        // runs an Elastic Search query against a given index
        // #### Parameters
        // 1. index: string name of index
        // 2. type: ES index document type
        // 3. queryObj: ES query object
        // 4. callback: function that is passed response from ES. Will be passed 'error' if request error.
        esIndexQuery: function(index,type,queryObj,callback){
            var path = '/'+index+'/'+type+'/_search';
            this.esBasic('post',path,queryObj,callback);
        },
        // ### esQuery
        // runs an Elastic Search query against the index provided in the node config
        // #### Parameters
        // 1. type: ES document type 'name'
        // 2. queryObj: ES query object
        // 3. callback: function that is passed response from ES. Will be passed 'error' if request error.
        esQuery: function (type,queryObj,callback){ 
            var path = '/'+this.index+'/'+type+'/_search';
            this.esBasic('post',path,queryObj,callback);
        },
        // ### esGetRecord
        // gets single Elastic Search record
        // yes the params ordering is inconsistent
        // #### Parameters
        // 1. uuid:(string) string id of record
        // 2. callback:(function) function for handling returned data (either record data or 'error')
        // 3. type:(string) (optional) string document type (records or media)
        esGetRecord: function (type,uuid,params,callback){ 
            /*if(_.isUndefined(type)){
                var type = 'records';
            }*/
            var path = '/idigbio/'+type+'/'+uuid;
            if(_.isFunction(params) && _.isUndefined(callback)){
                this.esBasic('get',path,params);
            }else if((_.isObject(params) || _.isString(params)) && _.isFunction(callback)){
                this.esBasic('get',path,params,callback);
            }
            //var server = searchServer.host + ':' + searchServer.port;
        }, 
        // ### runQuery
        // shortcut for running a 'records' index esQuery request
        // #### Parameters
        // 1. query: ES query object
        // 2. callback: function for handeling response
        runQuery: function (query,callback) {
            this.esQuery('records', query, function(resp) {
                if (_.isFunction(callback)) {
                    callback(resp);
                }
            });
        }
    });
})();