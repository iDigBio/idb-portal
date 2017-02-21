var express = require('express');
var config = require('./config/config');

require('babel-register');

function registerGracefulShutdown(signal, server, id) {
  process.on(signal, function() {
    console.log(`Server(${id}) received signal ${signal}, attempt exit`);
    server.close(function() {
      console.log(`Server(${id}) finished closing, exiting`);
      process.exit(0);
    });
  });
}

function startThisProcess(app, id) {
  return new Promise(function(resolve, reject) {
	id = id || 'main';
	  const server = app.listen(config.port, function() {
	    console.log(`Server(${id}) listening on port ${config.port}`);
	  });
	  registerGracefulShutdown('SIGTERM', server, id);
	  registerGracefulShutdown('SIGINT', server, id);
	  resolve();
  });
}

var realapp = express();

var app = require('./app/app.js').default;

realapp.use("/portal",app);
realapp.use("/",app);

startThisProcess(realapp);