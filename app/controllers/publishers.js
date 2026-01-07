import {createFactory} from '../createFactory.js'
import axios from 'axios'
import async from 'async'
import _ from 'lodash'
import RecordsetPage from 'public/client/js/react/build/recordset'
import StatsPage from 'public/client/js/react/build/stats'
import moment from 'moment'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

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
    axios.get(config.gbifApi + 'external/idigbio/collections')
      .then(function(response) {
        const body = response.data;
        const collections = Array.isArray(body) ? body.map(transformCollection) : [];	    
        res.render('collections', {
          activemenu: 'publishers',
          user: req.user,
          token: req.session._csrf,
          data: JSON.stringify(collections)
        });
      })
      .catch(function(err) {
        logger.error(err);
        res.render('collections', {
          activemenu: 'publishers',
          user: req.user,
          token: req.session._csrf,
          data: JSON.stringify([])
        });
      });
  },
  collection: function(req, res) {
    axios.get(config.gbifApi + 'external/idigbio/collections/' + req.params.id)
      .then(function(response) {
        const body = response.data;
        const collection = transformCollection(body);
        res.render('collection', {
          activemenu: 'publishers',
          user: req.user,
          token: req.session._csrf,
          data: JSON.stringify(collection)
        });
      })
      .catch(function(err) {
        if(err.response && err.response.status === 404) {
          res.status(404);
          res.render('404', {
            activemenu: 'publishers',
            user: req.user,
            token: req.session._csrf,
            id: req.params.id
          });
        } else {
          logger.error(err);
          res.status(500);
          res.render('500', {
            activemenu: 'publishers',
            user: req.user,
            token: req.session._csrf,
            id: req.params.id
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
    var defaultMin = moment().subtract(3,'years').startOf('month');
    async.parallel([
      function(cback) {
        var params = {"dateInterval": "month", "minDate": defaultMin};
        axios.post(config.api + 'summary/stats/search', params)
          .then(function(response) {
            var a_body = response.data;
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
            cback(null, 'one');
          })
          .catch(function(a_err) {
            cback(a_err, 'one');
          });
      },
      function(cback) {
        var params = {"dateInterval": "month", "minDate": defaultMin};
        axios.post(config.api + 'summary/stats/api', params)
          .then(function(response) {
            var a_body = response.data;
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
            cback(null, 'two');
          })
          .catch(function(a_err) {
            cback(a_err, 'two');
          });
      },
      function(cback) {
        var params = {"dateInterval": "year"};
        axios.post(config.api + 'summary/datehist', params)
          .then(function(response) {
            var a_body = response.data;
            _.forEach(a_body.dates, (rs_data, date) => {
              collected[date] = {"Date Collected": rs_data.itemCount};
            });
            cback(null, 'three');
          })
          .catch(function(a_err) {
            cback(a_err, 'three');
          });
      },
      function(cback) {
        var params = {top_fields: ["kingdom", "family"], count: 10};
        axios.post(config.api + 'summary/top/records', params)
          .then(function(response) {
            taxon["records"] = response.data;
            cback(null, 'four');
          })
          .catch(function(a_err) {
            cback(a_err, 'four');
          });
      },
      function(cback) {
        var params = {top_fields: ["kingdom", "family"], count: 10, rq: {hasMedia: true}};
        axios.post(config.api + 'summary/top/records', params)
          .then(function(response) {
            taxon["mediarecords"] = response.data;
            cback(null, 'five');
          })
          .catch(function(a_err) {
            cback(a_err, 'five');
          });
      },
      function(cback) {
        var params = {top_fields: ["flags"], count: 100};
        axios.post(config.api + 'summary/top/records', params)
          .then(function(response) {
            flags = response.data;
            cback(null, 'six');
          })
          .catch(function(a_err) {
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
    let rqurl = config.api + 'view/recordsets/' + req.params.id;
    
    const getRecordsetErrorViewVars = () => ({
      activemenu: 'publishers',
      user: req.user,
      token: req.session._csrf,
      id: req.params.id
    });

    axios.get(rqurl)
      .then(function(response) {
        var body = response.data;
        if(!body) {
          logger.error('unexpected blank response to search API request:', {url: rqurl});
          res.status(502);
          res.render('500', getRecordsetErrorViewVars());
        } else if (body.found === false) {
          res.status(404);
          res.render('404', getRecordsetErrorViewVars());
        } else if (body.statusCode >= 400) {
          res.status(body.statusCode);
          res.render('404', getRecordsetErrorViewVars());
        } else {
          // A successful response has neither 'found' nor 'statusCode'
          rbody = body;
          async.parallel([
            function(cback) {
              var q = {top_fields: ["flags"], count: 100, rq: {"recordset": req.params.id}};
              axios.post(config.api + 'summary/top/records/', q)
                .then(function(a_response) {
                  flags = a_response.data.flags;
                  cback(null, 'one');
                })
                .catch(function(a_err) {
                  cback(a_err, 'one');
                });
            },
            function(cback) {
              axios.post(config.api + 'summary/count/records/', {rq: {recordset: req.params.id}})
                .then(function(a_response) {
                  stotal = a_response.data.itemCount;
                  cback(null, 'two');
                })
                .catch(function(a_err) {
                  cback(a_err, 'two');
                });
            },
            function(cback) {
              axios.post(config.api + 'summary/count/media/', {mq: {recordset: req.params.id}})
                .then(function(a_response) {
                  mtotal = a_response.data.itemCount;
                  cback(null, 'three');
                })
                .catch(function(a_err) {
                  cback(a_err, 'three');
                });
            },
            function(cback) {
              var params = {"dateInterval": "month", "recordset": req.params.id, "minDate": moment().subtract(3,'years').startOf('month')};
              axios.post(config.api + 'summary/stats/search', params)
                .then(function(a_response) {
                  use = a_response.data;
                  cback(null, 'four');
                })
                .catch(function(a_err) {
                  cback(a_err, 'four');
                });
            },
            function(cback) {
              axios.post(config.api + 'summary/modified/records/', {rq: {recordset: req.params.id}})
                .then(function(a_response) {
                  lastRecord = a_response.data.lastModified.substring(0, 10);
                  cback(null, 'five');
                })
                .catch(function(a_err) {
                  cback(a_err, 'five');
                });
            },
            function(cback) {
              axios.post(config.api + 'summary/modified/media/', {mq: {recordset: req.params.id}})
                .then(function(a_response) {
                  lastMedia = a_response.data.lastModified.substring(0, 10);
                  cback(null, 'six');
                })
                .catch(function(a_err) {
                  cback(a_err, 'six');
                });
            }
          ], function(a_err, results) {
            if(a_err) {
              logger.error(a_err); // This should probably actually be handled better.
            }
            var rp = createFactory(RecordsetPage);
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
      })
      .catch(function(err) {
        logger.error(err);
        res.status(502);
        res.render('500', getRecordsetErrorViewVars());
      });
  },
  recordsetRedirect: function(req, res) {
    res.redirect('/portal/recordsets/' + req.params.id);
  }
};
