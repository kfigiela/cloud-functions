const exec = require('child_process').exec
const Promise = require('bluebird')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + '/bin'
const BUCKET = process.env.BUCKET_NAME
const FILES_BUCKET = process.env.FILES_BUCKET_NAME

function respondWith(callback,
                     {stdout, stderr, error: execErrr, time: execTime = []},
                     {error: downErr, time: downTime = []} = {},
                     {error: upErr, time: upTime = []} = {}) {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      ts: (new Date()).toString(),
      exec: {stdout, stderr, error: execErrr},
      download: {error: downErr},
      upload: {error: upErr},
      time: {
        exec: execTime,
        download: downTime,
        upload: upTime
      }
    })
  }
  callback(null, response)
}

function downloadFromS3(fileName, time) {
  console.log(`Downloading s3://${FILES_BUCKET}/${fileName}`)

  return new Promise((resolve, reject) => {
    s3.getObject({Bucket: FILES_BUCKET, Key: fileName}, (error, data = {}) => {
      const currTime = process.hrtime(time)

      if (error) reject({error, time: currTime})
      else resolve({data, error, time: currTime})
    })
  })
}

function uploadToS3(data, time) {
  const fileName = `random_${(new Date()).toISOString()}`

  console.log(`Uploading to s3://${BUCKET}/${fileName}`)

  return new Promise((resolve, reject) => {
    const params = {
      Bucket: BUCKET,
      Key: fileName,
      Body: data
    }

    s3.putObject(params, function (error) {
      const currTime = process.hrtime(time)
      const response = {error, time: currTime}

      if (error) reject(response)
      else resolve(response)
    })
  })
}
exports.hello = (event, context, callback) => {
  const responseBuilder = new ResponseBuilder()
  const t = process.hrtime()

  exec('hello', (error, stdout, stderr) => {
    const t2 = process.hrtime(t)
    const execRes = {stdout, stderr, error, time: t2}

    const fileSize = event.fileSize
    const fileName = `${fileSize}.dat`

    if (!fileSize) respondWith(callback, execRes)
    else {
      downloadFromS3(fileName, t2)
        .then(({data, error, time}) => {
          const downRes = {error, time}

          uploadToS3(data.Body, time)
            .then(upRes =>
              respondWith(callback, execRes, downRes, upRes)
            )
            .catch(upRes =>
              respondWith(callback, execRes, downRes, upRes)
            )
        })
        .catch(response =>
          respondWith(callback, execRes, response)
        )
    }
  })
}
