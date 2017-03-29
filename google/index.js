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

exports.event = (event, callback) => {
  console.log('Hello from "event"');
  callback();
};
