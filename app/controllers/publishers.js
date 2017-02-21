var request = require('request');
var async = require('async');
var config = require('config/config');
var RecordsetPage = require('public/client/js/react/build/recordset');
var fields = require('public/client/js/lib/fields');
var config = require("config/config");

//var RecordsetPage = require(appDir+'/public/react/build/recordset');
var createPublishers = {
    collections: function(req,res){

        request.get({"url": 'http://idigbio.github.io/idb-us-collections/collections.json', "json": true}, function(err, resp, body){
            res.render('collections', {
                activemenu: 'publishers',
                user: req.user,
                token: req.session._csrf,
                data: JSON.stringify(body)
            });
        }); 
    },
    collection: function(req,res){
        request.get({"url": 'http://idigbio.github.io/idb-us-collections/collections/'+req.params.id, "json": true}, function(err, resp, body){
            
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
        var flags = {};
        var stotal=0,mtotal=0;
        var rset={},rbody={},use;
        var lastRecord='',lastMedia='';
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
                        request.post({"url": config.api+'summary/count/media/', "json": true, "body": {mq: {recordset: req.params.id}}}, function(err, resp, body){
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
                    },
                    function(cback){
                        request.post({"url": config.api+'summary/modified/records/', "json": true, "body": {rq: {recordset: req.params.id}}}, function(err, resp, body){
                            lastRecord=body.lastModified.substring(0,10);
                            cback(null,'five');
                        })
                    },
                    function(cback){
                        request.post({"url": config.api+'summary/modified/media/', "json": true, "body": {mq: {recordset: req.params.id}}}, function(err, resp, body){
                            lastMedia=body.lastModified.substring(0,10);
                            cback(null,'six');
                        })
                    }
                ],function(err,results){
                    var React = require('react');
                    var ReactDOMServer = require('react-dom/server');
                    var Rp = React.createFactory(RecordsetPage);
                    var lastmodified=lastRecord>=lastMedia?lastRecord:lastMedia;
                    res.render('recordset',{
                        activemenu: 'publishers',
                        user: req.user,
                        token: req.session._csrf,
                        uuid: "'"+req.params.id+"'",
                        mtotal: mtotal,
                        stotal: stotal,
                        lastmodified: lastmodified,
                        flags: JSON.stringify(flags),
                        recordset: JSON.stringify(rbody),
                        use: JSON.stringify(use),
                        content: ReactDOMServer.renderToString(Rp({mtotal: mtotal, stotal: stotal, flags: flags, recordset: rbody, use: use, lastmodified: lastmodified, uuid: req.params.id}))
                    });
                })                           
            }
        });
    },
    recordsetRedirect: function(req,res){
        res.redirect('/portal/recordsets/'+req.params.id);
    } 
}

export default createPublishers;