var request = require('request');
var async = require('async');
var path = require('path'),
    appDir = path.dirname(require.main.filename);

var RecordsetPage = require(appDir+'/public/react/build/recordset');
var fields = require(appDir+'/public/js/app/search/lib/fields');
//var RecordsetPage = require(appDir+'/public/react/build/recordset');
module.exports = function(app, config) {
    return {
        publishers: function(req, res) {
            res.render('publishers', {
                activemenu: 'publishers',
                user: req.user,
                token: req.session._csrf
            });
        },
        recordset: function(req,res){
            var recordquery = function(){
                return {
                    "query": {
                        "filtered":{
                            "filter":{
                                "and":[
                                   {"term": {"recordset": req.params.id}}
                                ] 
                            }
                        }
                    },
                    "from": 0,
                    "size": 0,
                    "aggs": {}  
                }
            };
            var missing={};
            var stotal=0,mtotal=0;
            var rset={},rbody={};
            var keys = Object.keys(fields.byDataTerm);
            request.get({"url": 'https://search.idigbio.org/idigbio/recordsets/'+req.params.id, "json": true}, function(err, resp, body){
                if(body.found===false){
                    res.status(404);
                    res.render('404',{
                        activemenu: 'publishers',
                        user: req.user,
                        token: req.session._csrf,
                        id: req.params.id
                    });                    
                }else{
                    rbody = body;
                    rset = body._source.data['idigbio:data'];
                    async.parallel([
                        function(cback){
                            async.each(keys,function(key,callback){
                                var q = recordquery();
                                var aggkey = key.replace(':','_');//can't have : in agg name
                                q.aggs[aggkey]={"missing":{"field":'data.idigbio:data.'+key}};
                                request.post({"url": 'https://search.idigbio.org/idigbio/records/_search', "json": true, "body": q}, function(err, resp, body){
                                    missing[key]= body.aggregations[aggkey].doc_count;
                                    stotal = body.hits.total;
                                    callback(null);            
                                });    
                            },function(err){
                                //build table
                                cback(null,'one');
         
                            });                    
                        },
                        function(cback){
                            request.post({"url": 'https://search.idigbio.org/idigbio/mediarecords/_search', "json": true, "body": recordquery()}, function(err, resp, body){
                                mtotal = body.hits.total;
                                cback(null,'two')                            
                            });
                        }
                    ],function(err,results){
                        var React = require('react');
                        res.render('recordset',{
                            activemenu: 'publishers',
                            user: req.user,
                            token: req.session._csrf,
                            id: req.params.id,
                            recordset: rset,
                            content: React.renderComponentToString(RecordsetPage({mtotal: mtotal, stotal: stotal, missing: missing, recordset: rbody}))
                        });
                    })                           
                }
            });

        },
        recordsetRedirect: function(req,res){
            res.redirect('/portal/recordsets/'+req.params.id);
        } 
    }
}