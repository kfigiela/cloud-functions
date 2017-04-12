'use strict';
var exec = require('child_process').exec;

exports.http = (request, response) => {
  console.log('Hello from "http"');
  exec('bin/hello', function(error, stdout, stderr) {
    var resp = JSON.stringify({
        message: 'Hello Travis! Your function executed successfully!',
        exec: {"stdout":stdout, "stderr": stderr, "error": error}
    });
    response.status(200).send(resp);
  });
};

exports.hello_128 = exports.http;
exports.hello_256 = exports.http;
exports.hello_512 = exports.http;
exports.hello_1024 = exports.http;
exports.hello_2048 = exports.http;

exports.event = (event, callback) => {
  console.log('Hello from "event"');
  callback();
};
