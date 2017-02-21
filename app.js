var express = require('express'),
    expose = require('express-expose'),
	config = require('./config/config');

var app = express();

require('./config/express')(app, config);
require('./config/routes')(app, config);

var realapp = express();

realapp.use("/portal",app);
realapp.use("/",app);

console.log("Starting on Port: ", config.port);
realapp.listen(config.port);