var exec = require('child_process').exec;
var mkdirp = require('mkdirp');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var path = require('path');

var WORKSPACE_BASE = './tmp/';

var projectName = function(file) {
  return /(.*)\.md/.exec(file)[1];
};

var cloneWorkDir = function(src, dst) {
  return Promise.promisify(mkdirp)(dst)
  .then(function() {
    return fs.readdirAsync(src);
  })
  .then(function(srcFiles) {
    // symlink to all of the base slate files in our work dir
    return Promise.all(
      srcFiles.map(function(file) {
        return fs.symlinkAsync(path.resolve(src + file), dst + file);
      })
    );
  })
};

var prepare = function(projectFile) {
  var workDir = WORKSPACE_BASE + projectFile + '/';
  var slateDir = './slate/';

  return cloneWorkDir(slateDir, workDir)
  .then(function() {
    return fs.copyAsync('./downloads/' + projectFile, workDir + 'index.html.md');
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
    return prepare(projectFile)
    .then(function(workDir) {
      return compile(workDir)
      .then(function(siteDir) {
        return install(projectName(projectFile), siteDir);
      })
      .then(function() {
        return cleanup(workDir);
      });
    });
  } 
};

module.exports.build('test.md');
