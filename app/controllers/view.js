import {createFactory} from '../createFactory.js'
import request from 'request'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import RecordPage from 'public/client/js/react/build/record'
import createMediaPage from 'public/client/js/react/build/media'
import _ from 'lodash'
// var RecordPage = createFactory(require('public/client/js/react/build/record'));
// var MediaPage = createFactory(require('public/client/js/react/build/media'));
import config from 'config/config'; // eslint-disable-line no-unused-vars
import logger from 'app/logging'; // eslint-disable-line no-unused-vars
// const RecordPage = createFactory(createRecordPage);
const MediaPage = createFactory(createMediaPage);
// console.log(RecordPage)

export default {
  person: function(req, res) {
    res.render('person', {
      activemenu: 'people',
      uuid: req.params.id
    });
  },
  type: function(req, res) {
    const t = req.params.type;
    if (t === 'mediarecords' || t === 'records') {
      res.redirect(`/portal/${t}/${req.params.id}`);
    } else {
      res.status(404).send('Not Found');
    }
  },
  record: function(req, res) {
    const id = req.params.id;
    console.log(req.user)
    request.get({ url: `${config.api}view/records/${id}`, json: true }, function(err, resp, body) {

      if (err) {
        logger.error(err);
      }
      if (body.uuid) {
        const record = body;
        // console.log(record)
        // let Page = ReactDOMServer.renderToString( <RecordPage record={record} /> );
        res.render('record', {
          activemenu: 'search',
          id: req.params.id,
          // user: req.user,
          token: req.session._csrf,
          record: record,
          user: req.user ? JSON.stringify(req.user) : 'null',
          data: JSON.stringify(record),
          // content: Page
        });
      } else {
        res.status(404).render('404', {
          activemenu: 'search',
          id: req.params.id,
          user: req.user,
          token: req.session._csrf
        });
      }
    });
  },
  media: function(req, res) {
    const id = req.params.id;
    request.get({ url: `${config.api}view/mediarecords/${id}`, json: true }, function(err, resp, body) {
      if (err) {
        logger.error(err);
      }
      if (body.uuid) {
        const mediarecord = body;
        let record = {};
        const render = function() {
          const Page = ReactDOMServer.renderToString(MediaPage({ mediarecord: mediarecord, record: record }));
          res.render('media', {
            activemenu: 'search',
            id: req.params.id,
            user: req.user,
            token: req.session._csrf,
            content: Page,
            record: record,
            data: JSON.stringify({ record: record, mediarecord: mediarecord }),
            mediarecord: mediarecord
          });
        };
        if (_.has(mediarecord.indexTerms, 'records')) {
          request.get({ url: `${config.api}view/records/${mediarecord.indexTerms.records[0]}`, json: true }, function(r_err, r_resp, r_body) {
            if (r_err) {
              logger.error(r_err);
            }
            record = r_body;
            render();
          });
        } else {
          render();
        }
      } else {
        res.status(404).render('404', {
          activemenu: 'search',
          id: req.params.id,
          user: req.user,
          token: req.session._csrf
        });
      }
    });
  },
  list: function(req, res) {
    const base = 'https://s.idigbio.org/idigbio-list-pages/';
    let page = 'index.html';
    if (!_.isEmpty(req.params.page)) {
      page = req.params.page;
    }
    request.get(`${base}${page}`, function(err, resp, body) {
      if (err) {
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
