const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const request = require('request');

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + "/bin"
const tload = process.hrtime();

exports.hello = (event, context, callback) => {
  const t = process.hrtime();

  const macAddr = execSync('/sbin/ip link | grep "link-netnsid 0" | cut -f 6 -d " " | tr -d "[:space:]"').toString()
  const cpuModel = execSync('grep "model name" /proc/cpuinfo | head -n 1 | cut -f 2 -d : | xargs').toString()
  exec('hello', function(error, stdout, stderr) {
    const t2 = process.hrtime(t);
    const tload_diff = process.hrtime(tload);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        ts:   (new Date()).toString(),
        exec: {"stdout": stdout, "stderr": stderr, "error": error},
        time: [t2[0], t2[1]],
        time_since_loaded: [tload_diff[0], tload_diff[1]],
        macAddr: macAddr,
        cpuModel: cpuModel
      }),
    };
    callback(null, response);
  });
};

exports.hello128 = (event, context, callback) => {
  const t = process.hrtime();

  const macAddr = execSync('/sbin/ip link | grep "link-netnsid 0" | cut -f 6 -d " " | tr -d "[:space:]"').toString()
  const cpuModel = execSync('grep "model name" /proc/cpuinfo | head -n 1 | cut -f 2 -d : | xargs').toString()
  exec('hello', function(error, stdout, stderr) {
    const t2 = process.hrtime(t);
    const tload_diff = process.hrtime(tload);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        ts:   (new Date()).toString(),
        exec: {"stdout": stdout, "stderr": stderr, "error": error},
        time: [t2[0], t2[1]],
        time_since_loaded: [tload_diff[0], tload_diff[1]],
        macAddr: macAddr,
        cpuModel: cpuModel
      }),
    };
    callback(null, response);
    const influxLine = `experiment,provider=aws,memory=${process.env.MEMORY},macAddr="${macAddr}",cpuModel="${cpuModel.split(" ").join("\\ ").replace(/[\r\n]/g,'')}" value=${t2[0] + t2[1]/1000000000},timeSinceBoot=${tload_diff[0] + tload_diff[1]/1000000000}`;
    console.log(cpuModel.split(" ").join("\ ").replace(/[\r\n]/g,''));
    console.log(influxLine);
    request({
      method: "POST",
      url: process.env.INFLUX_ENDPOINT,
      body: influxLine,
      auth: {
        'user': process.env.INFLUX_USER,
        'pass': process.env.INFLUX_PASSWORD,
        'sendImmediately': true
      }
    }, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
    });
  });
};
