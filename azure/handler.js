const Promise = require('bluebird')
const azure = Promise.promisifyAll(require('azure-storage'))
const ResponseBuilder = require('cloud-functions-common').ResponseBuilder
const execToPromise = require('cloud-functions-common').execToPromise

const STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT
const STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY
const OUTPUT_CONTAINER = process.env.AZURE_STORAGE_CONTAINER
const INPUT_CONTAINER = process.env.AZURE_STORAGE_FILE_CONTAINER

const blobService = azure.createBlobService(STORAGE_ACCOUNT, STORAGE_ACCESS_KEY)

function fileName() {
  return `/random_${(new Date()).toISOString()}.txt`
}

function downloadRequest(fileName) {
  if (!fileName) return Promise.reject('Missing fileName in event data!')
  return blobService.getBlobToTextAsync(INPUT_CONTAINER, fileName)
}

function uploadRequest(data) {
  if (!data) return Promise.reject('No data to upload!')
  return blobService.createContainerIfNotExistsAsync(OUTPUT_CONTAINER, {
    publicAccessLevel: 'blob'
  })
    .then(() =>
      blobService.createBlockBlobFromTextAsync(OUTPUT_CONTAINER, fileName(), stdout)
    )
}

module.exports.hello = function (context, req) {
  const responseBuilder = new ResponseBuilder()

  responseBuilder.exec(execToPromise(__dirname + '\\hello.exe'))
    .then(() => {
      return responseBuilder.download(downloadRequest(req.body.fileName))
    })
    .then((data) => {
      return responseBuilder.upload(uploadRequest(data))
    })
    .then(() => {
      context.res = responseBuilder.toJSON()
      context.done()
    })
    .catch(() => {
      context.res = responseBuilder.toJSON()
      context.done()
    })
}


