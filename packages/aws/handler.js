const fs = require('fs')
const stream = require('stream')
const AWS = require('aws-sdk')
const bluebird = require('bluebird')
const s3 = new AWS.S3()
const putObjectStream = bluebird.promisify(s3.upload).bind(s3)
const {streamToPromise} = require('@quirk0.o/cloud-functions-common')
const Benchmark = require('@quirk0.o/benchmark')
const {logP} = require('@quirk0.o/async')

const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET_NAME
const INPUT_BUCKET = process.env.INPUT_BUCKET_NAME

const timestampedFileName = () => `transfer_${(new Date()).toISOString()}`
const file = (bucket, fileName, options) => Object.assign({Bucket: bucket, Key: fileName}, options)
const readFile = (bucket, fileName) => {
  try {
    const fileStream = s3.getObject(file(bucket, fileName)).createReadStream()
    const writer = fs.createWriteStream('/tmp/input.dat')

    return streamToPromise(fileStream.pipe(writer))
  } catch (e) {
    return Promise.reject(e)
  }
}

const writeFile = (bucket, fileName) => {
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

  return putObjectStream(file(bucket, fileName, {
    Body: generator
  }))
}
const response = (json) => ({statusCode: 200, body: JSON.stringify(json)})

exports.transfer = (event, context, callback) => {
  const body = JSON.parse(event.body)
  const inputFileName = body.fileName

  new Benchmark()
    .do('download')(
      logP(() => `Downloading s3://${INPUT_BUCKET}/${inputFileName}`),
      () => readFile(INPUT_BUCKET, inputFileName),
      logP(() => `Finished downloading`)
    )
    .do('upload')(
      timestampedFileName,
      logP((fileName) => `Uploading to s3://${OUTPUT_BUCKET}/${fileName}`),
      (fileName) => writeFile(OUTPUT_BUCKET, fileName),
      logP(() => `Finished uploading`)
    )
    .json()
    .then(logP(json => `Finished: ${JSON.stringify(json)}`))
    .then(json => callback(null, response(json)))
}
