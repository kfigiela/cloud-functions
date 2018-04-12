const runtimeConfig = require('cloud-functions-runtime-config')
const storage = require('@google-cloud/storage')()
const stream = require('stream')
const ResponseBuilder = require('cloud-functions-common').ResponseBuilder
const streamToPromise = require('cloud-functions-common').streamToPromise

const CONFIG_KEY = `serverless-research-config`
const INPUT_BUCKET_CONFIG_KEY = 'buckets/input'
const OUTPUT_BUCKET_CONFIG_KEY = 'buckets/output'

function downloadRequest (fileName) {
  console.log(`Downloading from gs://${fileName}`)

  return runtimeConfig.getVariable(CONFIG_KEY, INPUT_BUCKET_CONFIG_KEY)
    .then(inputBucketName => {
      const inputBucket = storage.bucket(inputBucketName)
      const inputFile = inputBucket.file(fileName)

      return inputFile.download()
        .then(data => {
          return data[0]
        })
    })
}

function uploadRequest (data) {
  const fileName = `random_${(new Date()).toISOString()}`
  console.log(`Uploading to gs://${fileName}`)

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

exports.transfer = (request, response) => {
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

exports.transfer_128 = (request, response) => {
  const responseBuilder = new ResponseBuilder()

  runtimeConfig.getVariable(CONFIG_KEY, INPUT_BUCKET_CONFIG_KEY)
    .then(inputBucketName => {
      const inputBucket = storage.bucket(inputBucketName)
      const inputFile = inputBucket.file(request.body.fileName)

      return inputFile.createReadStream()
    })
    .then(readStream => {
      return runtimeConfig.getVariable(CONFIG_KEY, OUTPUT_BUCKET_CONFIG_KEY)
        .then(outputBucketName => {
          const outputBucket = storage.bucket(outputBucketName)
          const outputFile = outputBucket.file(`random_${(new Date()).toISOString()}`)
          const outputStream = outputFile.createWriteStream()

          return streamToPromise(readStream.pipe(outputStream))
        })
    })
    .then(() => {
      responseBuilder._registerResponse(undefined, 'download')
      responseBuilder._response.upload = responseBuilder._response.download
      responseBuilder._time.upload = responseBuilder._time.download
      response.status(200).json(responseBuilder.toJSON())
    })
    .catch((err) => {
      responseBuilder._registerResponse(responseBuilder._formatStorageResponse(err), 'upload')
      response.status(200).json(responseBuilder.toJSON())
    })
}

exports.transfer_256 = exports.transfer
exports.transfer_512 = exports.transfer
exports.transfer_1024 = exports.transfer
exports.transfer_2048 = exports.transfer
