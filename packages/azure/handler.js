const Promise = require('bluebird')
const azure = Promise.promisifyAll(require('azure-storage'))
const ResponseBuilder = require('@quirk0.o/cloud-functions-common').ResponseBuilder

const STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING
const OUTPUT_CONTAINER = process.env.AZURE_STORAGE_CONTAINER
const INPUT_CONTAINER = process.env.AZURE_STORAGE_FILE_CONTAINER

const blobService = azure.createBlobService(STORAGE_CONNECTION_STRING)

function downloadRequest(context, fileName) {
  context.log(`Downloading from azs://${INPUT_CONTAINER}/${fileName}`)

  if (!fileName) return Promise.reject('Missing fileName in event data!')
  return blobService.getBlobToTextAsync(INPUT_CONTAINER, fileName)
}

function uploadRequest(context, data) {
  const fileName = `/random_${(new Date()).toISOString()}`

  context.log(`Uploading to azs://${OUTPUT_CONTAINER}/${fileName}`)

  if (!data) return Promise.reject('No data to upload!')
  return blobService.createContainerIfNotExistsAsync(OUTPUT_CONTAINER, {
    publicAccessLevel: 'blob'
  })
    .then(() =>
      blobService.createBlockBlobFromTextAsync(OUTPUT_CONTAINER, fileName, data)
    )
}

module.exports.hello = function (context, req) {
  const responseBuilder = new ResponseBuilder()

  responseBuilder.download(downloadRequest(context, req.body.fileName))
    .then((data) => {
      return responseBuilder.upload(uploadRequest(context, data))
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


