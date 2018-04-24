const runtimeConfig = require('cloud-functions-runtime-config')
const storage = require('@google-cloud/storage')()
const fs = require('fs')
const stream = require('stream')
const streamToPromise = require('@quirk0.o/cloud-functions-common').streamToPromise
const Benchmark = require('@quirk0.o/benchmark')
const {logP} = require('@quirk0.o/async')
const env = require('./environment')

const CONFIG_KEY = `serverless-research-config`
const INPUT_BUCKET_CONFIG_KEY = 'buckets/input'
const OUTPUT_BUCKET_CONFIG_KEY = 'buckets/output'

const config = (key) => () => runtimeConfig.getVariable(CONFIG_KEY, key)

const timestampedFileName = () => `transfer_${(new Date()).toISOString()}`
const file = (bucket, fileName) => storage.bucket(bucket).file(fileName)
const readFile = (bucket, fileName) => {
  const fileStream = file(bucket, fileName).createReadStream()
  const writer = fs.createWriteStream('/tmp/input.dat')

  return streamToPromise(fileStream.pipe(writer))
}

const writeFile = (bucket, fileName) => {
  const writeStream = file(bucket, fileName).createWriteStream()
  const generator = new stream.Readable()
  const size = 64 * 1024
  const chunkSize = 16384
  let i = 1

  generator._read = () => {
    if (i > size) {
      return generator.push(null)
    }
    generator.push('\0'.repeat(chunkSize))
    i += chunkSize
  }

  generator.pipe(writeStream)
}

exports.transfer = (request, response) => {
  const size = request.body.size
  const inputFileName = request.body.fileName

  new Benchmark()
    .do('download')(
      config(INPUT_BUCKET_CONFIG_KEY),
      logP(bucket => `Downloading gs://${bucket}/${inputFileName}`),
      (bucket) => readFile(bucket, inputFileName),
      logP(() => `Finished downloading`)
    )
    .do('upload')(
      config(OUTPUT_BUCKET_CONFIG_KEY),
      (bucket) => [bucket, timestampedFileName()],
      logP(([bucket, fileName]) => `Uploading to gs://${bucket}/${fileName}`),
      ([bucket, fileName]) => writeFile(bucket, fileName),
      logP(() => `Finished uploading`)
    )
    .json()
    .then(logP(json => `Finished: ${JSON.stringify(json)}`))
    .then(json => response.status(200).json(json))
}

exports['transfer-128'] = exports.transfer
exports['transfer-256'] = exports.transfer
exports['transfer-512'] = exports.transfer
exports['transfer-1024'] = exports.transfer
exports['transfer-2048'] = exports.transfer
exports['transfer-dev-128'] = exports.transfer
exports['transfer-dev-256'] = exports.transfer
exports['transfer-dev-512'] = exports.transfer
exports['transfer-dev-1024'] = exports.transfer
exports['transfer-dev-2048'] = exports.transfer
