var express = require('express');
var expose = require("express-expose");
var compression = require("compression");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var csrf = require("csurf");
var serveStatic = require("serve-static");
var favicon = require("serve-favicon");
var methodOverride = require("method-override");
var morgan = require("morgan");
var cons = require('consolidate');
var swig = require('swig');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var request = require('request');

import config from 'config/config';
import logger from 'app/logging';

var home = require('app/controllers/home').default;
var search = require('app/controllers/search').default;
var user = require('app/controllers/user').default;
var view = require('app/controllers/view').default;
var publishers = require('app/controllers/publishers').default;

import { Issuer, Strategy } from 'openid-client';
import passport from 'passport';

var app = expose(express());

Issuer.discover('http://localhost:8081/realms/iDigBio').then(keycloakIssuer => {
  // console.log('Discovered issuer %s %O', keycloakIssuer.issuer, keycloakIssuer.metadata);

  const client = new keycloakIssuer.Client({
    client_id: 'portal',
    client_secret: 'HSKYhUZrCgBUFQkaPwxFguV3bbkGyRGS',
    redirect_uris: ['http://localhost:3000/auth/callback'],
    post_logout_redirect_uris: ['http://localhost:3000/logout/callback'],
    response_types: ['code'],
  });


  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  function randString(length) {
  length = length ? length : 32;
  var string = '';
  for(var i = 0; i < length; i++) {
  var randomNumber = Math.floor(Math.random() * chars.length);
  string += chars.substring(randomNumber, randomNumber + 1);
  }
  return string;
  }

  app.use(compression());
  // set cache expiration on public directory
  app.use(serveStatic(config.root + '/public', {maxAge: 86400000}));
  app.engine('html', cons.swig);
  app.engine('haml', cons.haml);
  // NOTE: Swig requires some extra setup so that it knows where to look for includes and parent templates
  swig.setDefaults({
  cache: false,
  root: config.root + '/app/views',
  allowErrors: true
  });
  app.set('view engine', 'html');
  app.set('views', config.root + '/app/views');
  app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(morgan(':remote-addr - ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms'));
  app.use(bodyParser.urlencoded({"extended": true}));


  app.use(cookieParser(config.secret));
  if(config.env === "test") {
  app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
  maxAge: 7 * 24 * 60 * 60 * 1000
  }
  }));
  } else {
  var store = new RedisStore(config.redis);
  app.use(session({
  secret: config.secret,
  store: store,
  resave: false,
  saveUninitialized: true,
  cookie: {
  maxAge: 7 * 24 * 60 * 60 * 1000
  }
  }));
  }
  app.use(csrf());
  // app.use(function(req, res, next) {
  //   if(req.session) {
  //     if(req.session.login) {
  //       req.user = {
  //         is_authenticated: true,
  //         login: req.session.login,
  //         random: randString()
  //       };
  //     } else {
  //       req.user = {
  //         random: randString()
  //       };
  //     }
  //   } else {
  //     req.user = {};
  //   }
  //   // is user on portal.idigbio.org or www.idigbio.org/portal ?
  //
  //   req.user.refurl = req.originalUrl;
  //   req.user.host = req.headers.host;
  //   req.user.protocol = req.protocol;
  //   next();
  // });
  app.use(passport.initialize());
  app.use(passport.authenticate('session'));
  passport.use('oidc', new Strategy({client}, (tokenSet, userinfo, done)=>{
        return done(null, tokenSet.claims());
      })
  )
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  app.use(methodOverride());
  app.use(function(err, req, res, next) {
    logger.error("Request Error:", err);
    next(err);
  });

  // Expose config to the template renderer, especially for menu structure
  app.locals = config;
  app.all('*', function(req, res, next) {
    // console.log('inside all*')
    // if (req.isAuthenticated) {
    //   console.log('Authenticated request.')
      res.expose(req.headers, 'headers');
      var idbapi = {"host": config.api, "media_host": config.media};
      global.idbapi = idbapi;
      res.expose(idbapi, 'idbapi');
      next();
    // }
    // else {
    //   res.redirect('/auth/callback')
    // }
  });

  app.get('/auth/callback', (req, res, next) => {
    passport.authenticate('oidc', {
      successRedirect: '/search',
      failureRedirect: '/'
    })(req, res, next);
  });

  app.get('/logout', (req, res) => {
    // req.logout(function(err) {
    //   if (err) {
    //     return next(err);
    //   }
    //   req.session.destroy();
    //   res.clearCookie('connect.sid', { path: '/' });
    //   console.log(req.session)
      res.redirect(client.endSessionUrl());
    // });
  });

  app.get('/logout/callback', (req, res) => {
    req.logout(function(err) {
      if (err) {
        return next(err);
      }
      req.session.destroy();
      res.clearCookie('connect.sid', { path: '/' });
      console.log(req.session)
      res.redirect('/');
    });
  });


  const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      console.log(req.isUnauthenticated())
      return next()
    } else {
      res.redirect("/auth/callback")
    }
  }

  app.get('/', home.index);
  app.get('/search*', checkAuthenticated, search.searchBackbone);
  app.post('/stats', checkAuthenticated, search.sendStats);
  app.get('/view/:type/:id', checkAuthenticated, view.type);
  app.get('/records/:id', checkAuthenticated, view.record);
  app.get('/mediarecords/:id', checkAuthenticated, view.media);
  app.get('/tutorial', checkAuthenticated, home.tutorial);
  app.get('/publishers', checkAuthenticated, publishers.publishers);
  app.get('/citationguide', checkAuthenticated, publishers.citationguide);
  app.get('/portalstats', checkAuthenticated, publishers.stats);
  app.get('/collections', checkAuthenticated, publishers.collections);
  app.get('/collections/:id', checkAuthenticated, publishers.collection);
  app.get('/recordsets/:id', checkAuthenticated, publishers.recordset);
  app.get('/recordset/:id', checkAuthenticated, publishers.recordsetRedirect);
  // app.get('/logout', user.logout);
  // app.get('/login', checkAuthenticated, user.login);
  app.get('/authenticate', checkAuthenticated, user.authenticate);
  app.get('/list/:page?', checkAuthenticated, view.list);
  app.get('/verify', checkAuthenticated, user.verify);
  app.get('/login/javascripts/async.js', function(req, res, next) {
    res.setHeader("Content-Type", "text/javascript");
    res.send("");
  });
  app.use(function(req, res) {
    res.status(404).render('404', {
      title: "404"
    });
  });
})
export default app;
