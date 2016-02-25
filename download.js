var fs = require('fs');
var aws = require('aws-sdk');
var _ = require('lodash');
var Promise = require('bluebird');
var mkdirp = require('mkdirp');

var config = require('./config');

// credentials should be in env:
// AWS_ACCESS_KEY_ID and  AWS_SECRET_ACCESS_KEY
var s3 = new aws.S3();

// make sure our destination directory exists on startup
var DEST_DIR = './downloads/';
mkdirp.sync(DEST_DIR);

var listFiles = function() {

  return new Promise(function(resolve, reject) {
    s3.listObjects({
      Bucket: config.s3.bucket
    }, function(err, data) {
      if(err) {
        return reject(err);
      }
      
      var files = data.Contents.map(function(item) {
        return item.Key;
      });

      resolve(files);
    });
  });
};

var fetchFile = function(file) {

  return new Promise(function(resolve, reject) {
    s3.getObject({
      Bucket: config.s3.bucket,
      Key: file
    }, function(err, data) {
      if(err) {
        return reject(err);
      }

      resolve(data.Body);
    });
  });
};

var saveFile = function(file, buffer) {
  return Promise.promisify(fs.writeFile)(DEST_DIR + file, buffer);
};

module.exports = {
  listFiles: listFiles,
  fetchFile: fetchFile,
  saveFile: saveFile
};
