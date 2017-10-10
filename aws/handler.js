const Promise = require('bluebird')
const AWS = require('aws-sdk')
const s3 = Promise.promisifyAll(new AWS.S3())
const ResponseBuilder = require('cloud-functions-common').ResponseBuilder

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + '/bin'
const OUTPUT_BUCKET = process.env.BUCKET_NAME
const INPUT_BUCKET = process.env.FILES_BUCKET_NAME

function downloadRequest(fileName) {
  console.log(`Downloading s3://${INPUT_BUCKET}/${fileName}`)

  if (!fileName) return Promise.reject('Missing fileName in event data!')
  return s3.getObjectAsync({Bucket: INPUT_BUCKET, Key: fileName})
}

function uploadRequest(data) {
  const fileName = `random_${(new Date()).toISOString()}`

  console.log(`Uploading to s3://${OUTPUT_BUCKET}/${fileName}`)
  console.log(`Data: ${JSON.stringify(data)}`)

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
