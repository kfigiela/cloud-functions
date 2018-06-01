'use strict';

var exec = require('child_process').exec;
const execSync = require('child_process').execSync;

const tload = process.hrtime();

function hello(params) {
  const name = params.name || 'World';
  return new Promise((resolve, reject) => {
    const t = process.hrtime();

    const macAddr = process.env["HOSTNAME"];
    const cpuModel = execSync('grep "model name" /proc/cpuinfo | head -n 1 | cut -f 2 -d : | xargs').toString()

    exec(`chmod +x ${__dirname}/bin/hello && ${__dirname}/bin/hello`, function(error, stdout, stderr) {
      const t2 = process.hrtime(t);
      const tload_diff = process.hrtime(tload);      

      const resp = {
          ts:   (new Date()).toString(),
          exec: {"stdout":stdout, "stderr": stderr, "error": error},
          time: [t2[0], t2[1]],
          time_since_loaded: [tload_diff[0], tload_diff[1]],
          macAddr: macAddr,
          cpuModel: cpuModel
      };
      resolve(resp)
    });
  })
}

exports.hello = hello;

