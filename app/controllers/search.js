var request = require('request');

module.exports = function(app, config) {
  return {
    searchid: function(req, res) {
      //req.params.type = 'record'
      config.client.query("Select * from idigbio_saved_searches where id=$1 and type=$2", [req.params.id, req.params.type], function(error, results) {
        if (error) {
          console.log(error);
          res.send(500);
        } else {
          if (results.rowCount > 0) {
            var labels = {}
            var state = {}
            if (results.rows[0].state != "") {
              state = JSON.parse(results.rows[0].search);
            }
            config.searchconfig[req.params.type].base_fields.forEach(function(f) {
              labels[f] = config.fieldobj.solrTermToLabel(f);
            });
            res.expose(state, "initstate");
            res.expose(config.searchconfig[req.params.type], "searchcfg");
            res.expose(config.context_lists[req.params.type], "contexts");
            res.render(req.params.type + '-search', {
              activemenu: req.params.type,
              'view_type': req.params.type,
              'base_fields': config.searchconfig[req.params.type].base_fields,
              labels: labels,
              user: req.user,
              token: req.session._csrf,
              initlabel: results.rows[0].label
            });
          } else {
            res.send(404);
          }
        }
      });
    },
    search: function(req, res) {
      var labels = {}
      var state = {}
      if (req.query["state"]) {
        if (req.query["state"][0] == "{") {
          state = JSON.parse(req.query["state"]);
        } else {
          state = JSON.parse(new Buffer(req.query["state"], 'base64').toString('ascii'));
        }
      }
      config.searchconfig[req.params.type].base_fields.forEach(function(f) {
        labels[f] = config.fieldobj.solrTermToLabel(f);
      });
      var ctx = [];
      config.fieldobj.context_list.forEach(function(val) {
        if (config.context_lists[req.params.type].indexOf(val) != -1) {
          ctx.push(val);
        }
      });
      res.expose(ctx, "contexts");
      res.expose(state, "initstate");
      res.expose(config.searchconfig[req.params.type], "searchcfg");
      var page = req.params.type == 'records' ? 'search3' : 'mediarecords-search';
      res.render(page, {
        activemenu: req.params.type,
        'view_type': req.params.type,
        'base_fields': config.searchconfig[req.params.type].base_fields,
        labels: labels,
        user: req.user,
        token: req.session._csrf
      });
    },
    //portal search page
    searchBackbone: function(req, res){
      res.set('Cache-Control', 'public');
      res.render('search', {
        activemenu: 'search',
        user: req.user,
        token: req.session._csrf
      });     
    },

    sendStats: function(req, res){
      res.send(200);
      var ip = req.ip;
      var forward = req.headers['x-forwarded-for'];
      //don't send acis and localhost/dev requests
      //console.log('ip is: ' +ip);
      //console.log('x-forwarded-for is: '+req.headers['x-forwarded-for']);
      //console.log('remote address is: ' +req.connection.remoteAddress);
      //console.log('socket remote ip is: '+req.socket.remoteAddress);

      if(typeof forward != 'undefined' && forward.indexOf('10.244.19') !== 0  && ip !== '127.0.0.1'){
        var stats = {form:{type: req.body.type, search: req.body.search, results: req.body.results}};
        request.post(
          'http://idb-redis-stats.acis.ufl.edu:3000',
          stats 
        );
      }
    }
  }
}