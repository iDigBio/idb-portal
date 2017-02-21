var express = require('express');
var expose = require('express-expose');
var compression = require("compression");
var bodyParser = require("body-parser");
var csrf = require("csurf");
var serveStatic = require("serve-static");
var favicon = require("serve-favicon");
var methodOverride = require("method-override");
var morgan = require("morgan");
var cons = require('consolidate');
var swig = swig = require('swig');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var _ = require('lodash');

module.exports = function(app, config) {
    Object.keys(config).forEach(function(key){
        app.set(key,config[key])
    });
    app.use(compression());
    //set cache expiration on public directory
    app.use(serveStatic(config.root + '/public',{maxAge: 86400000}));
    app.use(serveStatic(config.root + '/public'));
    app.engine('html', cons.swig);
    app.engine('haml', cons.haml);
    // NOTE: Swig requires some extra setup so that it knows where to look for includes and parent templates
    swig.setDefaults({
        cache: false,
        root: config.root + '/app/views',
        allowErrors: true // allows errors to be thrown and caught by express instead of suppressed
    });
    app.set('view engine', 'html');
    app.set('views', config.root + '/app/views');
    app.use(favicon(config.root + '/public/img/favicon.ico'));
    app.use(morgan(':remote-addr - ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms'));
    app.use(bodyParser.urlencoded({"extended": true}));
    app.use(session({
        secret: app.get('secret'),
        store: new RedisStore(app.get('redis')),
        resave: false,
        saveUninitialized: true,        
        cookie: { //a week in milliseconds
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    }));
    app.use(csrf());
    app.use(function(req, res, next) {
        if(req.session) {
            //for simple cache breaking urls
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
            //
            if(req.session.login) {
                req.user = {
                    is_authenticated: true,
                    login: req.session.login,
                    random: randString()
                }
            }else{
                req.user = {
                    random: randString()
                }                     
            } 
        }else{
            req.user = {};
        }
        //is user on portal.idigbio.org or www.idigbio.org/portal ?
        
        req.user.refurl = req.originalUrl;
        req.user.host = req.headers.host;
        req.user.protocol = req.protocol;
        next();
    });
    app.use(methodOverride());
    app.use(function(req, res) {
        res.status(404).render('404', {
            title: "404"
        });
    });
    app.use(function(req, res) {
        res.status(500).render('500', {
            title: "500"
        });
    });
    app.locals = config;
};