import express from 'express';
import expose from 'express-expose';
import compression from 'compression';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import serveStatic from 'serve-static';
import favicon from 'serve-favicon';
import methodOverride from 'method-override';
import morgan from 'morgan';
import cons from 'consolidate';
import swig from 'swig';
import session from 'express-session';
const {createClient} = require('redis');
// import connectRedis from 'connect-redis';
// const RedisStore = connectRedis(session);
import RedisStore from "connect-redis"
import request from 'request';
import config from 'config/config';
import logger from 'app/logging';
import home from 'app/controllers/home';
import search from 'app/controllers/search';
import user from 'app/controllers/user';
import view from 'app/controllers/view';
import publishers from 'app/controllers/publishers';
import { Issuer, Strategy } from 'openid-client';
import passport from 'passport';
require('dotenv').config();

var app = expose(express());


// Discover the authentication provider (Keycloak), load the OIDC configuration from provider and create client
Issuer.discover('https://idb-keycloak01.acis.ufl.edu:8443/realms/iDigBio').then(async keycloakIssuer => {
  // console.log('Discovered issuer %s %O', keycloakIssuer.issuer, keycloakIssuer.metadata);
  const redisClient = await createClient({
    url: `redis://${config.redis.password}@${config.redis.host}:6379/2`,
  })

  await redisClient.on('connect', () => console.log('Redis client connected to Redis instance.')).connect();
  redisClient.on('error', err => console.log(`Redis client encountered an error: ${err} `))
  const client = new keycloakIssuer.Client({
    client_id: 'portal',
    client_secret: process.env.KC_SECRET,
    redirect_uris: [`https://${config.hostname}/auth/callback`],
    post_logout_redirect_uris: [`https://${config.hostname}/logout/callback`],
    response_types: ['code'],
  });


  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

  function randString(length) {
    length = length ? length : 32;
    var string = '';
    for (var i = 0; i < length; i++) {
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
  if (config.env === "test") {
    app.use(session({
      secret: config.secret,
      resave: false,
      saveUninitialized: true,
      ttl: 24 * 60 * 60 // TTL in seconds (e.g., 24 hours)
    }));
  } else {
    var store = new RedisStore({
      host: 'localhost',
      db: 2,
      client: redisClient
    });
    app.use(session({
      secret: config.secret,
      store: store,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000
      }
    }));
  }
  app.use(csrf());
  // LEGACY CODE
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

  // Initialize passport and configure to use our previously defined session
  app.use(passport.initialize());
  app.use(passport.session());

  // Tells passport to use OpenID Connect (OIDC) strategy with our previously defined OIDC client.
  passport.use('oidc', new Strategy({client}, (tokenSet, userinfo, done) => {
        return done(null, tokenSet.claims());
      })
  )

  // Serialization steps determines what gets stored in the session and what is retrieved.
  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  app.use(methodOverride());
  app.use(function (err, req, res, next) {
    logger.error("Request Error:", err);
    next(err);
  });

  async function getUserFromSession(sessionId, callback) {
    // Keep in mind redis values are stored as strings - you must parse the JSON string back into an object.
    const sessionDataString = await redisClient.get(`sess:${sessionId}`);
    const sessionData = JSON.parse(sessionDataString)
    return sessionData;

    // await redisClient.keys('*', (err, keys) => {
    //   if (err) throw err;
    //
    //   keys.forEach((key, i) => {
    //     console.log(`Key ${i}: ${key}`);
    //   });
    // })

    // redisClient?.get(`sess:${sessionId}`, (err, sessionData) => {
    //   if (err) {
    //     return callback(err);
    //   }
    //   if (!sessionData) {
    //     return callback(null, null); // Session not found
    //   }
    //
    //   try {
    //     const parsedData = JSON.parse(sessionData);
    //     const user = parsedData.passport ? parsedData.passport.user : null;
    //     callback(null, user);
    //   } catch (e) {
    //     callback(e);
    //   }
    // });
  }

  // Expose config to the template renderer, especially for menu structure
  app.locals = config;
  app.all('*', function (req, res, next) {
    res.expose(req.headers, 'headers');
    var idbapi = {"host": config.api, "media_host": config.media};
    global.idbapi = idbapi;
    res.expose(idbapi, 'idbapi');
    next();
  });

  // This endpoint forces a redirect to Keycloak's login page, then redirects as configured on success or failure.
  app.get('/auth/callback', (req, res, next) => {
    passport.authenticate('oidc', {
      successRedirect: '/search',
      failureRedirect: '/'
    })(req, res, next);
  });

  // Redirects to Keycloak's logout form. After successful logout redirects to /logout/callback.
  app.get('/logout', (req, res) => {
    res.redirect(client.endSessionUrl());
  });

  // Redirected to this endpoint after a successful logout on Keycloak
  app.get('/logout/callback', (req, res) => {
    const sessionId = req.session.id;
    req.logout(async function (err) {
      if (err) {
        return next(err);
      }
      // Close sessions and clean up cookies
      await req.session.destroy();
      await redisClient.del(`sess:${sessionId}`, (err) => {
        if (err) {
          console.log(err)
        }
        res.clearCookie('connect.sid', { path: '/' });
      })
      res.redirect('/');
      // res.clearCookie('connect.sid', {path: '/'});
      // res.redirect('/');
    });
  });

  app.get('/api/session', async (req, res) => {
    try {
      const sessionId = req.session.id;
      const user = await getUserFromSession(sessionId)
      if (user?.passport?.user) {
        res.json({user: user.passport.user});
      } else {
        res.status(401).json({user: null});
      }
    } catch (error) {
      res.status(401).json({user: null});
    }
  });


  // Middleware used to protect routes.
  const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    } else {
      res.redirect("/auth/callback") // redirecting to this endpoint will force a login.
    }
  }

  app.get('/', home.index);
  app.get('/search*', search.searchBackbone);
  app.post('/stats', checkAuthenticated, search.sendStats);
  app.get('/view/:type/:id', checkAuthenticated, view.type);
  app.get('/records/:id', view.record);
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
  app.get('/login/javascripts/async.js', function (req, res, next) {
    res.setHeader("Content-Type", "text/javascript");
    res.send("");
  });
  app.use(function (req, res) {
    res.status(404).render('404', {
      title: "404"
    });
  });
})
export default app;
