var express = require('express');

module.exports = function(multiplexer) {
  
  return {
    connect: function(app) {
      app.post('/update', multiplexer.update);
      app.use('/:id', multiplexer.serve); // has to be 'use' to work with the 'static' middleware
    }
  }
}
