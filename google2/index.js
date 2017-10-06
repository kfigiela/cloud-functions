const runtimeConfig = require('cloud-functions-runtime-config')
const storage = require('@google-cloud/storage')()
const stream = require('stream')
const Promise = require('bluebird')
const ResponseBuilder = require('cloud-functions-common').ResponseBuilder
const streamToPromise = require('cloud-functions-common').streamToPromise

const CONFIG_KEY = 'dev-config'
const INPUT_BUCKET_CONFIG_KEY = 'FILES_BUCKET_NAME'
const OUTPUT_BUCKET_CONFIG_KEY = 'BUCKET_NAME'

function downloadRequest(fileName) {
  console.log(`Downloading from gs://${fileName}`)

  return runtimeConfig.getVariable(CONFIG_KEY, INPUT_BUCKET_CONFIG_KEY)
    .then(inputBucketName => {
      const inputBucket = storage.bucket(inputBucketName)
      const inputFile = inputBucket.file(fileName)

      return inputFile.download()
        .then(data => {
          return {data: data[0], size: data[0].length}
        })
    })
}

function uploadRequest(data) {
  const fileName = `random_${(new Date()).toISOString()}`
  console.log(`Uploading to gs://${fileName}`)
  console.log('Data: ' + JSON.stringify(data))

  return runtimeConfig.getVariable(CONFIG_KEY, OUTPUT_BUCKET_CONFIG_KEY)
    .then(outputBucketName => {
      const outputBucket = storage.bucket(outputBucketName)
      const outputFile = outputBucket.file(fileName)
      const outputStream = outputFile.createWriteStream()
      const bufferStream = new stream.PassThrough()
      bufferStream.end(data)

      return streamToPromise(bufferStream.pipe(outputStream))
    })
}

exports.http = (request, response) => {
  const responseBuilder = new ResponseBuilder()

  responseBuilder.download(downloadRequest(request.body.fileName))
    .then((data) => {
      return responseBuilder.upload(uploadRequest(data))
    })
    .then(() => {
      response.status(200).json(responseBuilder.toJSON())
    })
    .catch(() => {
      response.status(200).json(responseBuilder.toJSON())
    })
}

exports.hello_128 = exports.http
exports.hello_256 = exports.http
exports.hello_512 = exports.http
exports.hello_1024 = exports.http
exports.hello_2048 = exports.http
