var express = require('express');
var expose = require('express-expose');
var cons = require('consolidate');
var swig = swig = require('swig');
var RedisStore = require('connect-redis')(express);
//var crypto = require('crypto');
//var a3 = require('../lib/a3')
//var libuuid = require('node-uuid');
var _ = require('lodash');
//var helper = require('../lib/helper');//(app,config);

module.exports = function(app, config) {
    app.configure(function() {
        Object.keys(config).forEach(function(key){
            app.set(key,config[key])
        });
        app.use(express.compress());
        //set cache expiration on public directory
        //app.use(express.static(config.root + '/public',{maxAge: 86400000}));
        app.use(express.static(config.root + '/public'));
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
        app.use(express.favicon(config.root + '/public/img/favicon.ico'));
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.cookieParser(app.get('secret')));
        app.use(express.session({
            store: new RedisStore(app.get('redis')),
            cookie: { //a week in milliseconds
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
        }));
        app.use(express.csrf());
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
                        refurl: req.originalUrl,
                        random: randString()
                    }
                }else{
                    req.user = {
                        refurl: req.originalUrl,
                        random: randString()
                    }                     
                } 
            }else{
                req.user = {
                    refurl: req.originalUrl
                }                
            }
            req.user.host = req.headers.host;
            req.user.protocol = req.protocol;
            next();
        });
        app.use(express.methodOverride());
        app.use(app.router);
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
        app.locals(config);        
    });
};