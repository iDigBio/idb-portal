
var request = require('request');
var path = require('path'),
    appDir = path.dirname(require.main.filename)
var RecordPage = require(appDir+'/public/client/js/react/build/record');
var MediaPage = require(appDir+'/public/client/js/react/build/media');
var async = require('async');
var _ = require('underscore');


module.exports = function(app, config) {
	
	return {
		person: function(req, res) {
			res.render('person', {
				activemenu: 'people',
				'uuid': req.params.id
			});
		},
		//keep this for redirecting deprecated paths
		type: function(req, res) {
			var t = req.params.type
			if(t=='mediarecords' || t=='records'){
				res.redirect('/portal/'+t+'/'+req.params.id);
			}else{
				res.send(404);
			}
		},
		record: function(req,res){
			var id = req.params.id;
			var base = 'http://search.idigbio.org/idigbio/';
			//var Page = React.renderComponentToString(RecordPage({record: record, provider: recordset}));
			request.get({"url": base+'records/'+id, "json": true}, function(err, resp, body){
				if(body.found){
					var record = body;
					request.get({"url": base+'recordsets/'+record._source.recordset, "json": true}, function(err, resp, body){
						var recordset = body;
						var React = require('react');
						var Page = React.renderComponentToString(RecordPage({record: record, provider: recordset}));
						//
						res.render('record', {
							activemenu: 'search',
							id: req.params.id,
							user: req.user,
							token: req.session._csrf,
							record: record,
							content: Page,
							recordset: recordset
						});	
					});					
				}else{
					res.status(404);
					res.render('404', {
						activemenu: 'search',
						id: req.params.id,
						user: req.user,
						token: req.session._csrf
					});	
				}
			});
		},

		media: function(req,res){
			var id = req.params.id;
			var qu = {size:1,from:0,query:{term:{uuid: id}}};
			var base = 'http://search.idigbio.org/idigbio/';
			var recordset, name='';
			
			request.post({ "url": base+'mediarecords/_search', "body": qu, "json": true}, function(err, resp, body){
				if(body.hits.total === 1){
					var mediarecord = body.hits.hits[0];
					var record = {};
					async.parallel([
						function(callback){
							request.get({url: base+'recordsets/'+mediarecord._source.recordset, "json": true}, function(err, resp, body){

								recordset = body;
								callback();
							});	
						},
						function(callback){
							if(_.has(mediarecord._source,'records')){
								request.get({url: base+'records/'+mediarecord._source.records[0], "json": true},function(err, resp, body){
				                    record = body;
									callback();
								});
							}else{
								callback();
							}
						}
					], function(){

						var React = require('react');
						var Page = React.renderComponentToString(MediaPage({mediarecord: mediarecord, provider: recordset, record: record}));
			           
			            res.render('media', {
			                activemenu: 'search',
			                id: req.params.id,
			                user: req.user,
			                token: req.session._csrf,
			                content: Page,
			                record: record,
			                recordset: recordset
			            }); 					
					});					
				}else{
					res.status(404);
		            res.render('404', {
		                activemenu: 'search',
		                id: req.params.id,
		                user: req.user,
		                token: req.session._csrf
		            }); 					
				}

			});
		},
		//web crawlers specimen list for search engine indexing
		list: function(req,res){
			var base = 'https://s.idigbio.org/idigbio-list-pages/';
			var page = 'index.html';
			if(!_.isEmpty(req.params.page)){
				page = req.params.page;
			}
			request.get(base+page,function(err,resp,body){
				res.render('list', {
	                activemenu: 'search',
	                id: req.params.id,
	                user: req.user,
	                token: req.session._csrf,
	                content: body
	            }); 
			});
		}
	}
}