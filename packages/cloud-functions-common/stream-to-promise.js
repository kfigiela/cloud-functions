function streamToPromise(stream) {
  return new Promise((resolve, reject) => {
    stream
      .on('error', function (err) {
        reject(err)
      })
      .on('finish', function () {
        resolve()
      })
  })
}

module.exports = streamToPromise
