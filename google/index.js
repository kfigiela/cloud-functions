'use strict';
var exec = require('child_process').exec;

exports.http = (request, response) => {
  const t = process.hrtime();

  exec('bin/hello', function(error, stdout, stderr) {
    [s, ns] = process.hrtime(t);

    const response = JSON.stringify({
        message: 'Hello Travis! Your function executed successfully!',
        input: event,
        exec: {"stdout":stdout, "stderr": stderr, "error": error},
        time: [s, ns]
    });
    response.status(200).send(response);
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

