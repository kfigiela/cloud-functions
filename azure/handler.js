'use strict';
var exec = require('child_process').exec;

module.exports.hello = function (context, req) {
  const t = process.hrtime();

  exec(__dirname + "\\hello.exe", function(error, stdout, stderr) {
    const t2 = process.hrtime(t);

    const response = {
        ts:   (new Date()).toString(),
        exec: {"stdout":stdout, "stderr": stderr, "error": error},
        time: [t2[0], t2[1]]
    };
    context.done(null, { body: response });
  });
};


