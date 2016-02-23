var fs = require('fs');
var express = require('express');
var Promise = require('bluebird');
var _ = require('lodash');

var access = Promise.promisify(fs.access);

var getPath = function(site) {
  return __dirname + '/sites/' + site;
};

// Create express route map from array of strings
var generateRouteMap = function(sites) {
    var sitePaths = sites.map(function(site) {

    var path = getPath(site);

    return access(path, fs.R_OK)
    .then(function() {
      return {
        site: site,
        path: path
      }
    });
  });

// Generate the Route Map, which maps a string to an HTTP server handler
// Ex: 
// {
//   foo: express.static('foo'),
//   bar: express.static('bar')
// }
  return Promise.all(sitePaths)
  .then(function(sitePaths) {
    return _.reduce(sitePaths, function(routeMap, sitePath) {
      routeMap[sitePath.site] = express.static(sitePath.path);
      return routeMap;
    }, {});
  });
};

module.exports = function(sites) {

  return generateRouteMap(sites)
  .then(function(routeMap) {

    return {
      serve: function(req, res, next) {
        
        var id = req.params.id;

        if(id && routeMap[id]) {
          routeMap[id](req, res, next);
        } else {
          next(new Error('Not found'));
        }
      },
      
      update: function(req, res, next) {
        // TODO - pull this 'sites' dynamically somehow
        generateRouteMap(sites)
        .then(function(updatedRouteMap) {
          routeMap = updatedRouteMap;
          res.json({
            "message": "Route update success"
          })
        }, function(err) {
          next(err);
        });
      }
    };
  });
};
