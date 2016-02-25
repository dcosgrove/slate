var exec = require('child_process').exec;
var mkdirp = require('mkdirp');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var path = require('path');

var WORKSPACE_BASE = './tmp/';

var projectName = function(file) {
  return /(.*)\.md/.exec(file)[1];
};

var prepare = function(projectFile) {
  var workDir = WORKSPACE_BASE + projectFile + '/';
  var slateDir = './slate/';

  return fs.copyAsync(slateDir, workDir)
  .then(function() {
    return fs.copyAsync('./downloads/' + projectFile, workDir + 'source/index.html.md');
  })
  .then(function() {
    return workDir;
  });
};

var compile = function(dir) {
  console.log('building in dir', dir);
  return new Promise(function(resolve, reject) {
    exec('bundle exec middleman build --clean', { 
        cwd: dir
    }, function(err, stdout, stderr) {
      if(err) {
        console.log('Source compilation failed')
        console.log(stdout);
        console.log(stderr);
        return reject(err);
      }

      resolve(dir + '/build');
    });
  });
};

var install = function(project, dir) {
  return fs.copyAsync(dir, './sites/' + project);
};

var cleanup = function(dir) {
  return fs.removeAsync(dir);
};

module.exports = {
  build: function(projectFile) {

    var name = projectName(projectFile);

    return prepare(projectFile)
    .then(function(workDir) {
      return compile(workDir)
      .then(function(siteDir) {
        return install(name, siteDir);
      })
      .then(function() {
        return cleanup(workDir);
      });
    })
    .then(function() {
      return name;
    });
  } 
};
