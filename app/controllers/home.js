var fs = require('fs');
var md = require("node-markdown").Markdown;

module.exports = function(app, config) {
	return {
		index: function(req, res) {
			var apiopts = app.get('pub-api-server');
			var apistr;
			if (apiopts.port) {
				apistr = "https://" + apiopts.host + ":" + apiopts.port + apiopts.path
			} else {
				apistr = "https://" + apiopts.host + "" + apiopts.path
			}
			var labels = {}
			var state = {}
			if (req.query["state"]) {
				if (req.query["state"][0] == "{") {
					state = JSON.parse(req.query["state"]);
				} else {
					state = JSON.parse(new Buffer(req.query["state"], 'base64').toString('ascii'));
				}
			}
			config.searchconfig["records"].base_fields.forEach(function(f) {
				labels[f] = config.fieldobj.solrTermToLabel(f);
			});
			var ctx = [];
			config.fieldobj.context_list.forEach(function(val) {
				if (config.context_lists["records"].indexOf(val) != -1) {
					ctx.push(val);
				}
			});

			res.expose(state, "initstate");
			res.expose(config.searchconfig["records"], "searchcfg");
			res.expose(ctx, "contexts");
			res.render('home-search', {
				activemenu: "portal",
				'view_type': "records",
				'base_fields': config.searchconfig["records"].base_fields,
				labels: labels,
				user: req.user,
				token: req.session._csrf,
				api_string: apistr
			});
			//   res.render('home', { activemenu: 'home', user: req.user });
		},
		tutorial: function(req, res) {
			res.render('tutorial',{
				activemenu: 'tutorial',
				user: req.user
			});
			
			/*
			fs.readFile('static/tutorial/Home.md', 'utf-8', function(err, navdata) {
				fs.readFile('static/tutorial/Home-Text.md', 'utf-8', function(err, data) {
					if (err) {
						res.send(404);
					} else {
						nav_markdown = md(navdata);
						output_markdown = md(data);
						res.render('markdown', {
							activemenu: 'tutorial',
							output_markdown: output_markdown,
							nav_markdown: nav_markdown,
							user: req.user
						});
					}
				});
			});*/
		},
	}
}