'use strict';
var exec = require('child_process').exec;

module.exports.hello = function (context, req) {
  const t = process.hrtime();

  exec(__dirname + "\\hello.exe", function(error, stdout, stderr) {
    [s, ns] = process.hrtime(t);

    const response = JSON.stringify({
        message: 'Hello Travis! Your function executed successfully!',
        input: event,
        exec: {"stdout":stdout, "stderr": stderr, "error": error},
        time: [s, ns]
    });
    context.done(null, { body: resp });
  });
};


