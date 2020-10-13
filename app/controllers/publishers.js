var request = require('request');
var async = require('async');
var _ = require('lodash');
var RecordsetPage = require('public/client/js/react/build/recordset');
var StatsPage = require('public/client/js/react/build/stats');

var React = require('react');
var ReactDOMServer = require('react-dom/server');

import config from 'config/config'; // eslint-disable-line no-unused-vars
import logger from 'app/logging'; // eslint-disable-line no-unused-vars

const collectionDefaultValues = {
  'institution': '',
  'collection': '',
  'recordsets': '',
  'recordsetQuery': '',
  'institution_code': '', // there is no longer an <IH> postfix on IH entries
  'collection_code': '',
  'collection_uuid': '',
  'collection_lsid': '',
  'collection_url': '',
  'collection_catalog_url': '',
  'description': '',
  'descriptionForSpecialists': '', // not in GBIF, used 10 times in iDigBio
  'cataloguedSpecimens': null,
  'knownToContainTypes': null, // not in GBIF, used 84 times in iDigBio
  'taxonCoverage': '',
  'geographic_range': '',
  'collectionExtent': '', // not in GBIF, when used in iDigBio then the value is often the same or used in same way as 'cataloguedSpecimens'
  'contact': '', // GBIF have multiple contacts for a collection. Currently the first is in the response.
  'contact_role': '',
  'contact_email': '',
  'mailing_address': '',
  'mailing_city': '',
  'mailing_state': '',
  'mailing_zip': '',
  'physical_address': '',
  'physical_city': '',
  'physical_state': '',
  'physical_zip': '',
  'UniqueNameUUID': '',
  'attributionLogoURL': '', // the logo of the institution is used - this field has never been filled in iDigBio data
  'providerManagedID': '', // not in GBIF and currently no info in iDigBio either
  'derivedFrom': '', // not in GBIF and currently no info in iDigBio either
  'sameAs': '',
  'flags': '', // not in GBIF and currently no info in iDigBio either
  'portalDisplay': '', // not in GBIF and currently no info in iDigBio either
  'lat': null, // the location if the institution is used
  'lon': null // the location if the institution is used
}

function transformCollection(record) {
  // No mapping required, the GBIF endpoint currently provides a response that maps to iDigBio
  // All we need to do it to add empty values, the iDigBio portal currently has that in the response.

  // The GBIF response contains internal keys. Strip those for now. It might be useful for linking at some point.
  delete record.collectionKey;
  delete record.institutionKey;
  return Object.assign({}, collectionDefaultValues, record);
}

// var RecordsetPage = require(appDir+'/public/react/build/recordset');
export default {
  collections: function(req, res) {

    request.get({"url": config.gbifApi + 'external/idigbio/collections', "json": true}, function(err, resp, body) {
      if(err) {
        logger.error(err);
      }
      const collections = body.map(transformCollection);
      res.render('collections', {
        activemenu: 'publishers',
        user: req.user,
        token: req.session._csrf,
        data: JSON.stringify(collections)
      });
    });
  },
  collection: function(req, res) {
    request.get({"url": config.gbifApi + 'external/idigbio/collections/' + req.params.id, "json": true}, function(err, resp, body) {
      if(err) {
        logger.error(err);
      } else if(resp.statusCode === 404) {
        res.status(404);
        res.render('404', {
          activemenu: 'publishers',
          user: req.user,
          token: req.session._csrf,
          id: req.params.id
        });
      } else {
        const collection = transformCollection(body);
        res.render('collection', {
          activemenu: 'publishers',
          user: req.user,
          token: req.session._csrf,
          data: JSON.stringify(collection)
        });
      }
    });
  },
  publishers: function(req, res) {
    res.render('publishers', {
      activemenu: 'publishers',
      user: req.user,
      token: req.session._csrf
    });
  },
  citationguide: function(req, res) {
    res.render('citationguide', {
      activemenu: 'publishers',
      user: req.user,
      token: req.session._csrf
    });
  },
  stats: function(req, res) {
    var usage = {};
    var ingest = {};
    var ingestCumulative = {};
    var collected = {};
    var taxon = {};
    var flags = {};
    var defaultMin = "2015-01-16";
    async.parallel([
      function(cback) {
        var params = {"dateInterval": "month", "minDate": defaultMin};
        request.post({"url": config.api + 'summary/stats/search', "json": true, "body": params}, function(a_err, a_resp, a_body) {
          _.forEach(a_body.dates, (rs_data, date) => {
            usage[date] = {};
            _.forEach(rs_data, (stats, rs) => {
              _.forEach(stats, (v, k) => {
                if(usage[date][k]) {
                  usage[date][k] += v;
                } else {
                  usage[date][k] = v;
                }
              });
            });
          });

          cback(a_err, 'one');
        });
      },
      function(cback) {
        var params = {"dateInterval": "month", "minDate": defaultMin};
        request.post({"url": config.api + 'summary/stats/api', "json": true, "body": params}, function(a_err, a_resp, a_body) {
          _.forEach(a_body.dates, (rs_data, date) => {
            ingestCumulative[date] = {};
            var rsCount = 0;
            _.forEach(rs_data, (stats, rs) => {
              rsCount += 1;
              _.forEach(stats, (v, k) => {
                if(ingestCumulative[date][k]) {
                  ingestCumulative[date][k] += v;
                } else {
                  ingestCumulative[date][k] = v;
                }
              });
            });
            ingestCumulative[date]["recordsets"] = rsCount;
          });

          var dates = _.keys(ingestCumulative).sort();
          for(var i = dates.length - 2; i > 0; i--) {
            ingest[dates[i]] = {};
            _.forEach(ingestCumulative[dates[i]], (v, k) => {
              ingest[dates[i]][k] = ingestCumulative[dates[i + 1]][k] - ingestCumulative[dates[i]][k];
            });
          }

          cback(a_err, 'two');
        });
      },
      function(cback) {
        var params = {"dateInterval": "year"};
        request.post({"url": config.api + 'summary/datehist', "json": true, "body": params}, function(a_err, a_resp, a_body) {
          _.forEach(a_body.dates, (rs_data, date) => {
            collected[date] = {"Date Collected": rs_data.itemCount};
          });

          cback(a_err, 'three');
        });
      },
      function(cback) {
        var params = {top_fields: ["kingdom", "family"], count: 10};
        request.post({"url": config.api + 'summary/top/records', "json": true, "body": params}, function(a_err, a_resp, a_body) {
          taxon["records"] = a_body;

          cback(a_err, 'four');
        });
      },
      function(cback) {
        var params = {top_fields: ["kingdom", "family"], count: 10, rq: {hasMedia: true}};
        request.post({"url": config.api + 'summary/top/records', "json": true, "body": params}, function(a_err, a_resp, a_body) {
          taxon["mediarecords"] = a_body;

          cback(a_err, 'five');
        });
      },
      function(cback) {
        var params = {top_fields: ["flags"], count: 100};
        request.post({"url": config.api + 'summary/top/records', "json": true, "body": params}, function(a_err, a_resp, a_body) {
          flags = a_body;

          cback(a_err, 'six');
        });
      },
    ], function(a_err, results) {
      if(a_err) {
        logger.error(a_err); // This should probably actually be handled better.
      }
      var sp = React.createFactory(StatsPage);
      var Page = ReactDOMServer.renderToString(sp({}));
      res.render('stats', {
          activemenu: 'publishers',
          id: req.params.id,
          user: req.user,
          token: req.session._csrf,
          content: Page,
          data: JSON.stringify({usage: usage, ingest: ingest, ingestCumulative: ingestCumulative, defaultMin: defaultMin, collected: collected, taxon: taxon, flags: flags}),
      });
    });
  },
  recordset: function(req, res) {
    var flags = {};
    var stotal = 0, mtotal = 0;
    var rbody = {}, use = {};
    var lastRecord = '', lastMedia = '';
    request.get({"url": config.api + 'view/recordsets/' + req.params.id, "json": true}, function(err, resp, body) {
      if(err) {
        logger.error(err);
      }
      if(body.found === false) {
        res.status(404);
        res.render('404', {
          activemenu: 'publishers',
          user: req.user,
          token: req.session._csrf,
          id: req.params.id
        });
      } else if (body.statusCode >= 400) {
        res.status(body.statusCode);
        res.render('404', {
          activemenu: 'publishers',
          user: req.user,
          token: req.session._csrf,
          id: req.params.id
        });
      } else {
        rbody = body;
        async.parallel([
          function(cback) {
            var q = {top_fields: ["flags"], count: 100, rq: {"recordset": req.params.id}};
            request.post({"url": config.api + 'summary/top/records/', "json": true, "body": q}, function(a_err, a_resp, a_body) {
              flags = a_body.flags;
              cback(a_err, 'one');
            });
          },
          function(cback) {
            request.post({"url": config.api + 'summary/count/records/', "json": true, "body": {rq: {recordset: req.params.id}}}, function(a_err, a_resp, a_body) {
              stotal = a_body.itemCount;
              cback(a_err, 'two');
            });
          },
          function(cback) {
            request.post({"url": config.api + 'summary/count/media/', "json": true, "body": {mq: {recordset: req.params.id}}}, function(a_err, a_resp, a_body) {
              mtotal = a_body.itemCount;
              cback(a_err, 'three');
            });
          },
          function(cback) {
            var params = {"dateInterval": "month", "recordset": req.params.id, "minDate": "2015-01-15"};
            request.post({"url": config.api + 'summary/stats/search', "json": true, "body": params}, function(a_err, a_resp, a_body) {
              use = a_body;
              cback(a_err, 'four');
            });
          },
          function(cback) {
            request.post({"url": config.api + 'summary/modified/records/', "json": true, "body": {rq: {recordset: req.params.id}}}, function(a_err, a_resp, a_body) {
              lastRecord = a_body.lastModified.substring(0, 10);
              cback(a_err, 'five');
            });
          },
          function(cback) {
            request.post({"url": config.api + 'summary/modified/media/', "json": true, "body": {mq: {recordset: req.params.id}}}, function(a_err, a_resp, a_body) {
              lastMedia = a_body.lastModified.substring(0, 10);
              cback(a_err, 'six');
            });
          }
        ], function(a_err, results) {
          if(a_err) {
            logger.error(a_err); // This should probably actually be handled better.
          }
          var rp = React.createFactory(RecordsetPage);
          var lastmodified = lastRecord >= lastMedia ? lastRecord : lastMedia;
          res.render('recordset', {
            activemenu: 'publishers',
            user: req.user,
            token: req.session._csrf,
            uuid: "'" + req.params.id + "'",
            mtotal: mtotal,
            stotal: stotal,
            lastmodified: lastmodified,
            flags: JSON.stringify(flags),
            recordset: JSON.stringify(rbody),
            use: JSON.stringify(use),
            content: ReactDOMServer.renderToString(rp({mtotal: mtotal, stotal: stotal, flags: flags, recordset: rbody, use: use, lastmodified: lastmodified, uuid: req.params.id}))
          });
        });
      }
    });
  },
  recordsetRedirect: function(req, res) {
    res.redirect('/portal/recordsets/' + req.params.id);
  }
};
