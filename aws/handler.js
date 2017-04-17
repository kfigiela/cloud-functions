const exec = require('child_process').exec;

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + "/bin"


exports.hello = (event, context, callback) => {
  const t = process.hrtime();

  exec('hello', function(error, stdout, stderr) {
    [s, ns] = process.hrtime(t);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        exec: {"stdout":stdout, "stderr": stderr, "error": error},
        time: [s, ns]
      }),
    };
    callback(null, response);
  });
};
