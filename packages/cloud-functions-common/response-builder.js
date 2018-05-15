class ResponseBuilder {
  constructor(time) {
    this._response = {}
    this._time = {}

    this._hrtime = time || process.hrtime()
  }

  exec(pending, responseMapper = x => x) {
    return this._handlePromise(pending, 'exec', responseMapper, this._formatExecResponse)
  }

  download(pending, responseMapper = x => x) {
    return this._handlePromise(pending, 'download', responseMapper, this._formatStorageResponse)
  }

  upload(pending, responseMapper = x => x) {
    return this._handlePromise(pending, 'upload', responseMapper, this._formatStorageResponse)
  }

  toJSON() {
    return {
      ts: (new Date()).toString(),
      exec: this._response.exec,
      download: this._response.download,
      upload: this._response.upload,
      time: this._time
    }
  }

  _handlePromise(pending, key, responseMapper, formatter) {
    console.log('starting ' + key)
    return new Promise((resolve, reject) => {
      pending
        .then(response => {
          console.log(key + ' success')
          const data = responseMapper(response)
          this._registerResponse(formatter(null, data), key)
          resolve(data)
        })
        .catch(error => {
          console.log(key + ' failure: ' + error)
          this._registerResponse(formatter(error), key)
          reject()
        })
    })
  }

  _registerResponse(response, key) {
    this._response[key] = response
    this._time[key] = process.hrtime(this._hrtime)
    this._hrtime = process.hrtime()
  }

  _formatExecResponse(errorResponse, response) {
    errorResponse = errorResponse || {}
    response = response || {}
    return {
      stdout: errorResponse.stdout || response.stdout,
      stderr: errorResponse.stderr,
      error: errorResponse.error
    }
  }

  _formatStorageResponse(error, response) {
    response = response || {}
    return {
      error: error ? error.toString() : null,
      size: response.length
    }
  }
}

module.exports = ResponseBuilder
