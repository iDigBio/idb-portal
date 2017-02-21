var express = require('express'),
    expose = require('express-expose'),
	config = require('config/config');

var app = express();
export default app;

require('config/init-express')(app, config);
require('config/init-routes')(app, config);
