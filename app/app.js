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
import connectRedis from 'connect-redis'; // Import the connect-redis module normally
const RedisStore = connectRedis(session); // Use it with session


import config from '../config/config';
import logger from './logging';

import home from './controllers/home';
import search from './controllers/search';
import user from './controllers/user';
import view from './controllers/view';
import publishers from './controllers/publishers.js';


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


var app = expose(express());
export default app;

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
app.use(function(req, res, next) {
  if(req.session) {
    if(req.session.login) {
      req.user = {
        is_authenticated: true,
        login: req.session.login,
        random: randString()
      };
    } else {
      req.user = {
        random: randString()
      };
    }
  } else {
    req.user = {};
  }
  // is user on portal.idigbio.org or www.idigbio.org/portal ?

  req.user.refurl = req.originalUrl;
  req.user.host = req.headers.host;
  req.user.protocol = req.protocol;
  next();
});
app.use(methodOverride());
app.use(function(err, req, res, next) {
  logger.error("Request Error:", err);
  next(err);
});

// Expose config to the template renderer, especially for menu structure
app.locals = config;
app.all('*', function(req, res, next) {
  res.expose(req.headers, 'headers');
  var idbapi = {"host": config.api, "media_host": config.media};
  global.idbapi = idbapi;
  res.expose(idbapi, 'idbapi');
  next();
});

/*
app.get('/eol_api/*', function(req, res) {
    var url = "";
    if(req.originalUrl.slice(0, 7) === "/portal") {
        url = "http://eol.org/api" + req.originalUrl.slice(15);
    } else {
        url = "http://eol.org/api" + req.originalUrl.slice(8);
    }
    request.get({
        url: url
    }, function(error, response, body) {
        res.setHeader("Content-Type", "application/json");
        if (typeof response != "undefined") {
          res.send(response.body);
        }
        else {
          var temp = { header: "empty" };
          res.send(temp);
        }
    });
});
*/

// app.use('/records/:id', function(req, res, next) {
//     console.log(req)
// })

app.get('/', home.index);
app.get('/search*', search.searchBackbone);
app.post('/stats', search.sendStats);
// app.get('/search/:type/:id', search.searchid);
app.get('/view/:type/:id', view.type);
app.get('/records/:id', view.record);
app.get('/mediarecords/:id', view.media);
app.get('/tutorial', home.tutorial);
app.get('/publishers', publishers.publishers);
app.get('/citationguide', publishers.citationguide);
app.get('/portalstats', publishers.stats);
app.get('/collections', publishers.collections);
app.get('/collections/:id', publishers.collection);
app.get('/recordsets/:id', publishers.recordset);
app.get('/recordset/:id', publishers.recordsetRedirect);
app.get('/logout', user.logout);
app.get('/login', user.login);
app.get('/authenticate', user.authenticate);
app.get('/list/:page?', view.list);
app.get('/verify', user.verify);
app.get('/login/javascripts/async.js', function(req, res, next) {
  res.setHeader("Content-Type", "text/javascript");
  res.send("");
});
app.use(function(req, res) {
  res.status(404).render('404', {
    title: "404"
  });
});
