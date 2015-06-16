var request = require('request');
var async = require('async');
var path = require('path'),
    appDir = path.dirname(require.main.filename);
var config = require(appDir+'/config/config');
var RecordsetPage = require(appDir+'/public/client/js/react/build/recordset');
var fields = require(appDir+'/public/client/js/lib/fields');
//var RecordsetPage = require(appDir+'/public/react/build/recordset');
module.exports = function(app, config) {
    return {
        collections: function(req,res){

            request.get({"url": 'http://internal.idigbio.org/collections', "json": true}, function(err, resp, body){
                res.render('collections', {
                    activemenu: 'publishers',
                    user: req.user,
                    token: req.session._csrf,
                    data: JSON.stringify(body)
                });
            });
        },
        collection: function(req,res){
            request.get({"url": 'http://internal.idigbio.org/collections/'+req.params.id, "json": true}, function(err, resp, body){
                
                res.render('collection', {
                    activemenu: 'publishers',
                    user: req.user,
                    token: req.session._csrf,
                    data: JSON.stringify(body)
                });
            });
        },
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
            var flags;
            var stotal=0,mtotal=0;
            var rset={},rbody={},use;
            var keys = Object.keys(fields.byDataTerm);
            request.get({"url": config.api+'view/recordsets/'+req.params.id, "json": true}, function(err, resp, body){
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
                    rset = body.data;
                    async.parallel([
                        function(cback){
                            var q ={top_fields:["flags"],count: 100, rq: {"recordset": req.params.id}};
                            request.post({"url": config.api+'summary/top/records/', "json": true, "body": q}, function(err, resp, body){
                                flags = body.flags;
                                cback(null,'one');            
                            });                
                        },
                        function(cback){
                            request.post({"url": config.api+'summary/count/records/', "json": true, "body": {rq: {recordset: req.params.id}}}, function(err, resp, body){
                                stotal = body.itemCount;
                                cback(null,'two')                            
                            });
                        },
                        function(cback){
                            request.post({"url": config.api+'summary/count/media/', "json": true, "body": {rq: {recordset: req.params.id}}}, function(err, resp, body){
                                mtotal = body.itemCount;
                                cback(null,'three')                            
                            });
                        },
                        function(cback){
                            var params={"dateInterval":"month","recordset": req.params.id,"minDate":"2015-01-15"};
                            request.post({"url": config.api+'summary/stats/search', "json": true, "body": params},function(err,resp,body){
                                use=body;
                                cback(null,'four');
                            })
                        }
                    ],function(err,results){
                        var React = require('react');
                        var Rp = React.createFactory(RecordsetPage);
                        res.render('recordset',{
                            activemenu: 'publishers',
                            user: req.user,
                            token: req.session._csrf,
                            uuid: "'"+req.params.id+"'",
                            mtotal: mtotal,
                            stotal: stotal,
                            flags: JSON.stringify(flags),
                            recordset: JSON.stringify(rbody),
                            use: JSON.stringify(use),
                            content: React.renderToString(Rp({mtotal: mtotal, stotal: stotal, flags: flags, recordset: rbody, use: use, uuid: req.params.id}))
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