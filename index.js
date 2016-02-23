
var Promise = require('bluebird');
var express = require('express');
var morgan = require('morgan');

var routes = require('./routes');

// temporary hard coded list til we pull from somewhere
var sites = [
  'forex',
  'pricegun'
];

var multiplexer = require('./multiplexer')(sites);

var app = express();
var server = require('http').createServer(app);

app.use(morgan('dev'));

multiplexer.then(function(multiplexer) {
  routes(multiplexer).connect(app);

  app.use(function(err, req, res, next) {
    res.status(400).json({
      error: err.message
    });
  });
})
.then(function() {
  server.listen(8001, function() {
    console.log('server started on port', 8001);
  });

  
});
