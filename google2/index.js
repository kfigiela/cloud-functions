const runtimeConfig = require('cloud-functions-runtime-config')
const storage = require('@google-cloud/storage')()
const stream = require('stream')
const Promise = require('bluebird')
const ResponseBuilder = require('cloud-functions-common').ResponseBuilder
const streamToPromise = require('cloud-functions-common').streamToPromise
const execToPromise = require('cloud-functions-common').execToPromise

const CONFIG_KEY = 'dev-config'
const INPUT_BUCKET_CONFIG_KEY = 'FILES_BUCKET_NAME'
const OUTPUT_BUCKET_CONFIG_KEY = 'BUCKET_NAME'

function downloadRequest(fileName) {
  return runtimeConfig.getVariable(CONFIG_KEY, INPUT_BUCKET_CONFIG_KEY)
    .then(inputBucketName => {
      const inputBucket = storage.bucket(inputBucketName)
      const inputFile = inputBucket.file(fileName)

      return inputFile.download()
        .then(data => {
          return {data, size: `${data.length}kB`}
        })
    })
}

function uploadRequest(data) {
  return runtimeConfig.getVariable(CONFIG_KEY, OUTPUT_BUCKET_CONFIG_KEY)
    .then(outputBucketName => {
      console.log(outputBucketName)
      const outputBucket = storage.bucket(outputBucketName)
      const outputFile = outputBucket.file(`random_${(new Date()).toISOString()}`)
      const outputStream = outputFile.createWriteStream()
      const bufferStream = new stream.PassThrough()
      bufferStream.end(data)

      return streamToPromise(bufferStream.pipe(outputStream))
    })
}

exports.http = (request, response) => {
  const responseBuilder = new ResponseBuilder()

  responseBuilder.exec(execToPromise('bin/hello'))
    .then(() => {
      return responseBuilder.download(downloadRequest(request.body.fileName))
    })
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
