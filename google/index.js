'use strict';
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
const tload = process.hrtime();

var macAddr;

require('crypto').randomBytes(48, function(err, buffer) {
  macAddr = buffer.toString('hex');
});

exports.http = (request, response) => {
  const t = process.hrtime();

  exec('bin/hello', function(error, stdout, stderr) {
    const t2 = process.hrtime(t);
    const tload_diff = process.hrtime(tload);
    const cpuModel = execSync('grep "model name" /proc/cpuinfo | head -n 1 | cut -f 2 -d : | xargs').toString()

    const resp = ({
        ts:   (new Date()).toString(),
        exec: {"stdout":stdout, "stderr": stderr, "error": error},
        time: [t2[0], t2[1]],
        time_since_loaded: [tload_diff[0], tload_diff[1]],
        macAddr: macAddr,
        cpuModel: cpuModel
    });
    response.status(200).json(resp);
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

