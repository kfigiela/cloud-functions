const Promise = require('bluebird')
const AWS = require('aws-sdk')
const s3 = Promise.promisifyAll(new AWS.S3())
const ResponseBuilder = require('cloud-functions-common').ResponseBuilder

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + '/bin'
const OUTPUT_BUCKET = process.env.BUCKET_NAME
const INPUT_BUCKET = process.env.FILES_BUCKET_NAME

function downloadRequest(fileName, options) {
  console.log(`Downloading s3://${INPUT_BUCKET}/${fileName}`)

  if (!fileName) return Promise.reject('Missing fileName in event data!')
  return s3.getObjectAsync(Object.assign({Bucket: INPUT_BUCKET, Key: fileName}, options))
}

function uploadRequest(data) {
  const fileName = `random_${(new Date()).toISOString()}`

  console.log(`Uploading to s3://${OUTPUT_BUCKET}/${fileName}`)

  if (!data) return Promise.reject('No data to upload!')
  return s3.putObjectAsync({Bucket: OUTPUT_BUCKET, Key: fileName, Body: data})
}

exports.hello = (event, context, callback) => {
  const responseBuilder = new ResponseBuilder()
  const body = JSON.parse(event.body)

  responseBuilder.download(downloadRequest(body.fileName), response => response.Body)
    .then((data) => {
      return responseBuilder.upload(uploadRequest(data))
    })
    .then(() => {
      callback(null, {statusCode: 200, body: JSON.stringify(responseBuilder.toJSON())})
    })
    .catch(() => {
      callback(null, {statusCode: 200, body: JSON.stringify(responseBuilder.toJSON())})
    })
}

exports.hello128 = (event, context, callback) => {
  const responseBuilder = new ResponseBuilder()
  const body = JSON.parse(event.body)
  const fileName = body.fileName
  const contentLength = body.contentLength

  if (!fileName) {
    callback(null, {statusCode: 200, body: 'Missing fileName in event data'})
  }
  if (!contentLength) {
    callback(null, {statusCode: 200, body: 'Missing contentLength in event data'})
  }

  console.log(`Downloading s3://${INPUT_BUCKET}/${fileName}`)

  const inputStream = s3.getObject({Bucket: INPUT_BUCKET, Key: fileName}).createReadStream()
  s3.putObject({
    Bucket: OUTPUT_BUCKET,
    Key: `random_${(new Date()).toISOString()}`,
    Body: inputStream,
    ContentLength: contentLength
  }, (err, data) => {
    if (err) {
      responseBuilder._registerResponse(responseBuilder._formatStorageResponse(err), 'upload')
      callback(null, {statusCode: 200, body: JSON.stringify(responseBuilder.toJSON())})
    }
    responseBuilder._registerResponse(undefined, 'download')
    responseBuilder._response.upload = responseBuilder._response.download
    responseBuilder._time.upload = responseBuilder._time.download
    callback(null, {statusCode: 200, body: JSON.stringify(responseBuilder.toJSON())})
  })
}
