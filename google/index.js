'use strict';
var exec = require('child_process').exec;

exports.http = (request, response) => {
  const t = process.hrtime();

  exec('bin/hello', function(error, stdout, stderr) {
    const t2 = process.hrtime(t);

    const resp = JSON.stringify({
        exec: {"stdout":stdout, "stderr": stderr, "error": error},
        time: [t2[0], t2[1]]
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

