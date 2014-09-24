var express = require('express'),
    expose = require('express-expose'),
	config = require('./config/config');

var app = express();

require('./config/express')(app, config);
require('./config/routes')(app, config);

var realapp = express();

realapp.use("/portal",app)
realapp.use("/",app)

realapp.listen(config.port);