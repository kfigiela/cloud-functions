'use strict';
var exec = require('child_process').exec;
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + "/bin"


module.exports.hello = (event, context, callback) => {
  exec('hello', function(error, stdout, stderr) {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hello Travis! Your function executed successfully!',
        input: event,
        exec: {"stdout":stdout, "stderr": stderr, "error": error}
      }),
    };
    callback(null, response);
  });
};
