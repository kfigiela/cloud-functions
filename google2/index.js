const exec = require('child_process').exec
const runtimeConfig = require('cloud-functions-runtime-config')
const storage = require('@google-cloud/storage')()
const stream = require('stream')
const Promise = require('bluebird')

exports.http = (request, response) => {
  const t = process.hrtime()

  exec('bin/hello', function (execErr, stdout, stderr) {
    const t2 = process.hrtime(t)

    runtimeConfig.getVariable('dev-config', 'FILES_BUCKET_NAME')
      .then((inputBucketName) => {
        console.log(inputBucketName)
        const inputBucket = storage.bucket(inputBucketName)
        const inputFile = inputBucket.file(`${request.body.fileSize}.dat`)

        inputFile.download((err, data) => {
          const t3 = process.hrtime(t2)

          if (err) {
            const res = ({
              ts: (new Date()).toString(),
              exec: {stdout: stdout, stderr: stderr, error: execErr},
              download: {error: err},
              time: {
                exec: [t2[0], t2[1]],
                download: [t3[0], t3[1]]
              }
            })

            response.status(200).json(res)
          } else {
            runtimeConfig.getVariable('dev-config', 'BUCKET_NAME')
              .then((outputBucketName) => {
                console.log(outputBucketName)
                const outputBucket = storage.bucket(outputBucketName)
                const outputStream = outputBucket.file(`random_${(new Date()).toISOString()}`).createWriteStream()
                const bufferStream = new stream.PassThrough()
                bufferStream.end(data)

                bufferStream.pipe(outputStream)
                  .on('error', function (err) {
                    const res = ({
                      ts: (new Date()).toString(),
                      exec: {stdout: stdout, stderr: stderr, error: execErr},
                      download: {},
                      upload: {error: err},
                      time: {
                        exec: [t2[0], t2[1]],
                        download: [t3[0], t3[1]]
                      }
                    })

                    response.status(200).json(res)
                  })
                  .on('finish', function () {
                    const t4 = process.hrtime(t3)

                    const res = ({
                      ts: (new Date()).toString(),
                      exec: {stdout: stdout, stderr: stderr, error: execErr},
                      download: {},
                      upload: {},
                      time: {
                        exec: [t2[0], t2[1]],
                        download: [t3[0], t3[1]],
                        upload: [t4[0], t4[1]]
                      }
                    })

                    response.status(200).json(res)
                  })
              })
          }
        })
      })
  })
}

exports.hello_128 = exports.http
exports.hello_256 = exports.http
exports.hello_512 = exports.http
exports.hello_1024 = exports.http
exports.hello_2048 = exports.http
