const runtimeConfig = require('cloud-functions-runtime-config')
const storage = require('@google-cloud/storage')()
const fs = require('fs')
const stream = require('stream')
const streamToPromise = require('cloud-functions-common').streamToPromise
const env = require('./environment')

const CONFIG_KEY = `serverless-research-config`
const INPUT_BUCKET_CONFIG_KEY = 'buckets/input'
const OUTPUT_BUCKET_CONFIG_KEY = 'buckets/output'

const config = (key) => () => runtimeConfig.getVariable(CONFIG_KEY, key)

const timestampedFileName = () => `random_${(new Date()).toISOString()}`
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

class Benchmark {
  constructor() {
    this._keys = []
    this._queue = []
    this._response = {}
    this._time = {}
  }

  do(key) {
    this._keys.push(key)
    return (...fns) => {
      this._queue.push(this._task(key, fns))
      return this
    }
  }

  json() {
    return pipeP(...this._queue)
      .then(() => Object.assign(
        {
          ts: (new Date()).toString(),
          time: this._time
        },
        this._keys
          .map(key => ({[key]: this._response[key]}))
          .reduce((acc, response) => Object.assign(acc, response), {})
      ))
  }

  _task(key, fns) {
    return () => {
      let hrtime = process.hrtime()
      return pipeP(...fns)
        .then(() => this._time[key] = process.hrtime(hrtime))
        .then(logP(() => `${key} finished`))
        .catch(tapError(logP(err => `${key} error: ${err}`)))
        .catch(error => this._response[key] = {error})
    }
  }
}

exports.transfer = (request, response) => {
  const size = request.body.size
  const inputFileName = request.body.fileName

  new Benchmark()
    .do('download')(
      config(INPUT_BUCKET_CONFIG_KEY),
      (bucket) => readFile(bucket, inputFileName)
    )
    .do('upload')(
      config(OUTPUT_BUCKET_CONFIG_KEY),
      (bucket) => writeFile(bucket, timestampedFileName())
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
