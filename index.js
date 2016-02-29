
var Promise = require('bluebird');
var express = require('express');
var morgan = require('morgan');

var config = require('./config');
var routes = require('./routes');

var download = require('./download');
var generator = require('./generator');

// temporary hard coded list til we pull from somewhere

var multiplexer = require('./multiplexer');

var app = express();
var server = require('http').createServer(app);

app.use(morgan('dev'));

download.pullAllFiles()
.then(function(files) {
  return Promise.all(
    files.map(function(file) {
      return generator.build(file);
    })
  );
})
.then(function(projects) {
  return multiplexer(projects);
})
.then(function(multiplexer) {
  routes(multiplexer).connect(app);

  app.use(function(err, req, res, next) {
    res.status(400).json({
      error: err.message
    });
  });
})
.then(function() {
  server.listen(config.port, function() {
    console.log('PP Slate multiplexer started on port', config.port);
  });
}, function(err) {
  console.log('Error', err);
});
