'use strict';

var exec = require('child_process').exec;

function hello(params) {
  const name = params.name || 'World';
  return new Promise((resolve, reject) => {
    const t = process.hrtime();

    exec(`chmod +x ${__dirname}/bin/hello && ${__dirname}/bin/hello`, function(error, stdout, stderr) {
      const t2 = process.hrtime(t);

      const resp = {
          exec: {"stdout":stdout, "stderr": stderr, "error": error},
          time: [t2[0], t2[1]]
      };
      resolve(resp)
    });
  })
}

exports.hello = hello;

