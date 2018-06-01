'use strict';
var exec = require('child_process').exec;
const tload = process.hrtime();

module.exports.hello = function (context, req) {
  const t = process.hrtime();
  const tload_diff = process.hrtime(tload);

  exec(__dirname + "\\hello.exe", function(error, stdout, stderr) {
    const t2 = process.hrtime(t);

    const response = {
        ts:   (new Date()).toString(),
        exec: {"stdout":stdout, "stderr": stderr, "error": error},
        time: [t2[0], t2[1]],
        time_since_loaded: [tload_diff[0], tload_diff[1]],
        macAddr: process.env["WEBSITE_INSTANCE_ID"]
    };
    context.done(null, { body: response });
  });
};


