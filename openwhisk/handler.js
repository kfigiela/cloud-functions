'use strict';

var exec = require('child_process').exec;

function hello(params) {
  const name = params.name || 'World';
  return new Promise((resolve, reject) => {
    exec(`chmod +x ${__dirname}/bin/hello && ${__dirname}/bin/hello`, function(error, stdout, stderr) {
      var resp = {
          message: 'Hello Travis! Your function executed successfully!',
          exec: {"stdout":stdout, "stderr": stderr, "error": error}
      };
      resolve(resp);
    });
  })
}

exports.hello = hello;
