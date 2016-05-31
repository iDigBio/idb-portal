
var request = require('request');
var path = require('path'),
    appDir = path.dirname(require.main.filename);
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var RecordPage = React.createFactory(require(appDir+'/public/client/js/react/build/record'));
var MediaPage = React.createFactory(require(appDir+'/public/client/js/react/build/media'));
var async = require('async');
var _ = require('lodash');


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
			//var Page = React.renderComponentToString(RecordPage({record: record, provider: recordset}));
			request.get({"url": config.api+'view/records/'+id, "json": true}, function(err, resp, body){
		
				if(body.uuid){
					var record = body;
					var React = require('react');
					var Page = ReactDOMServer.renderToString(RecordPage({record: record}));
					//
					
					res.render('record', {
						activemenu: 'search',
						id: req.params.id,
						user: req.user,
						token: req.session._csrf,
						record: record,
						data: JSON.stringify(record),
						content: Page
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
			//var qu = {size:1,from:0,query:{term:{uuid: id}}};
			var id = req.params.id;
			var recordset, name='';
			
			request.get({"url": config.api+'view/mediarecords/'+id, "json": true}, function(err, resp, body){
				if(body.uuid){
					var mediarecord = body;
					var record = {};
					var render = function(){

						var React = require('react');
						var Page = ReactDOMServer.renderToString(MediaPage({mediarecord: mediarecord, record: record}));
			           
			            res.render('media', {
			                activemenu: 'search',
			                id: req.params.id,
			                user: req.user,
			                token: req.session._csrf,
			                content: Page,
			                record: record,
			                data: JSON.stringify({record: record, mediarecord: mediarecord}),
			                mediarecord: mediarecord
			            }); 					
					}
					if(_.has(mediarecord.indexTerms,'records')){
						request.get({url: config.api+'view/records/'+mediarecord.indexTerms.records[0], "json": true},function(err, resp, body){
		                    record = body;
							render();
						});
					}else{
						render();
					}					
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