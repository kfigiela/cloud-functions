const exec = require('child_process').exec;
const request = require('request');

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + "/bin"


exports.hello = (event, context, callback) => {
  const t = process.hrtime();

  exec('hello', function(error, stdout, stderr) {
    const t2 = process.hrtime(t);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        ts:   (new Date()).toString(),
        exec: {"stdout":stdout, "stderr": stderr, "error": error},
        time: [t2[0], t2[1]]
      }),
    };
    callback(null, response);
    const influxLine = `experiment,provider=aws,memory=${process.env.MEMORY} value=${t2[0] + t2[1]/1000000000}`;
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
