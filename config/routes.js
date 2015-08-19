var request = require('request');

module.exports = function(app, config) {

    //home route
    var home = require('../app/controllers/home')(app, config);
    var search = require('../app/controllers/search')(app, config);
    var user = require('../app/controllers/user')(app, config);
    var view = require('../app/controllers/view')(app, config);
    var publishers = require('../app/controllers/publishers')(app, config);
    var apipath = config.api;

    //app.expose('var idbpath ='+config.api+';', 'javascript');
    app.all('*', function(req, res, next) {
        //res.expose(config.searchServer, 'searchServer');
        //res.expose('test', 'test');
        res.expose(req.headers, 'headers');
        res.expose({"host": config.api}, 'idbapi');
        next();
    });

    app.get('/eol_api/*', function(req,res){
        var url;
        if (req.originalUrl.slice(0,7) == "/portal") {
            url = "http://eol.org/api" + req.originalUrl.slice(15)
        } else {
            url = "http://eol.org/api" + req.originalUrl.slice(8)
        }
        //console.log(url);
        request.get({
            url: url
        },function (error, response, body) {
            res.send(response.body);
        });
    });

    app.get('/', home.index);
    app.get('/search*', search.searchBackbone);
    app.post('/stats', search.sendStats);
    //app.get('/records/:id', search.searchid);
    app.get('/search/:type/:id', search.searchid);
    app.get('/view/:type/:id', view.type);
    app.get('/records/:id', view.record);
    app.get('/mediarecords/:id', view.media);
    app.get('/tutorial', home.tutorial);
    app.get('/publishers', publishers.publishers);
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
    })
    app.get('*', function(req, res) {
        res.render('404', 404);
    });
};