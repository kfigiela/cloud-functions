'use strict';
var exec = require('child_process').exec;

module.exports.hello = function (context, req) {
  // Add any neccessary telemetry to support diagnosing your function
  context.log('HTTP trigger occured!');

  exec(__dirname + "\\hello.exe", function(error, stdout, stderr) {
    const name = req.query.name || (req.body && req.body.name) || 'World';
    const resp = JSON.stringify({
        message: 'Hello Travis! Your function executed successfully!',
        exec: {"stdout":stdout, "stderr": stderr, "error": error},
        dir: __dirname
    });
    context.done(null, { body: resp });
  });
  // Read properties from the incoming request, and respond as appropriate.
};
