const exec = require('child_process').exec
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + '/bin'
const BUCKET = process.env.BUCKET_NAME

exports.hello = (event, context, callback) => {
  const t = process.hrtime()

  exec('hello', function (error, stdout, stderr) {
    const t2 = process.hrtime(t)

    const params = {
      Bucket: BUCKET,
      Key: `/random_${(new Date()).toISOString()}`,
      Body: stdout
    }

    s3.putObject(params, function (err) {
      const t3 = process.hrtime(t2)

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          ts: (new Date()).toString(),
          exec: {'stdout': stdout, 'stderr': stderr, 'error': error},
          upload: {'err': err},
          time: {
            exec: [t2[0], t2[1]],
            upload: [t3[0], t3[1]]
          }
        })
      }
      callback(null, response)
    })
  })
}
