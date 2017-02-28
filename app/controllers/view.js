
var request = require('request');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var RecordPage = React.createFactory(require('public/client/js/react/build/record'));
var MediaPage = React.createFactory(require('public/client/js/react/build/media'));
var _ = require('lodash');

import config from 'config/config'; // eslint-disable-line no-unused-vars
import logger from 'app/logging'; // eslint-disable-line no-unused-vars

export default {
  person: function(req, res) {
    res.render('person', {
      activemenu: 'people',
      'uuid': req.params.id
    });
  },
  // keep this for redirecting deprecated paths
  type: function(req, res) {
    var t = req.params.type;
    if(t === 'mediarecords' || t === 'records') {
      res.redirect('/portal/' + t + '/' + req.params.id);
    } else {
      res.send(404);
    }
  },
  record: function(req, res) {
    var id = req.params.id;
    // var Page = React.renderComponentToString(RecordPage({record: record, provider: recordset}));
    request.get({"url": config.api + 'view/records/' + id, "json": true}, function(err, resp, body) {
      if(err) {
        logger.error(err);
      }
      if(body.uuid) {
        var record = body;
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
      } else {
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

  media: function(req, res) {
    // var qu = {size:1,from:0,query:{term:{uuid: id}}};
    var id = req.params.id;

    request.get({"url": config.api + 'view/mediarecords/' + id, "json": true}, function(err, resp, body) {
      if(err) {
        logger.error(err);
      }

      if(body.uuid) {
        var mediarecord = body;
        var record = {};
        var render = function() {
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
        };
        if(_.has(mediarecord.indexTerms, 'records')) {
          request.get({url: config.api + 'view/records/' + mediarecord.indexTerms.records[0], "json": true}, function(r_err, r_resp, r_body) {
            if(r_err) {
              logger.error(r_err);
            }
            record = r_body;
            render();
          });
        } else {
          render();
        }
      } else {
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
  // web crawlers specimen list for search engine indexing
  list: function(req, res) {
    var base = 'https://s.idigbio.org/idigbio-list-pages/';
    var page = 'index.html';
    if(!_.isEmpty(req.params.page)) {
      page = req.params.page;
    }
    request.get(base + page, function(err, resp, body) {
      if(err) {
        logger.error(err);
      }
      res.render('list', {
                activemenu: 'search',
                id: req.params.id,
                user: req.user,
                token: req.session._csrf,
                content: body
            });
    });
  }
};
