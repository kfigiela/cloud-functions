const exec = require('child_process').exec
const gcloud = require('google-cloud')
const stream = require('stream')

exports.http = (request, response) => {
  const t = process.hrtime()

  exec('bin/hello', function (error, stdout, stderr) {
    const t2 = process.hrtime(t)

    const bucket = gcloud.storage().bucket('serverless-gcf-random-dev-bucket')
    const file = bucket.file(`random_${(new Date()).toISOString()}`)
    const bufferStream = new stream.PassThrough()
    bufferStream.end(stdout)

    bufferStream.pipe(file.createWriteStream())
      .on('error', function (err) {
      })
      .on('finish', function () {
        const t3 = process.hrtime(t2)

        const res = ({
          ts: (new Date()).toString(),
          exec: {'stdout': stdout, 'stderr': stderr, 'error': error},
          time: {
            exec: [t2[0], t2[1]],
            upload: [t3[0], t3[1]]
          }
        })

        response.status(200).json(res)
      })
  })
}

exports.hello_128 = exports.http
exports.hello_256 = exports.http
exports.hello_512 = exports.http
exports.hello_1024 = exports.http
exports.hello_2048 = exports.http
