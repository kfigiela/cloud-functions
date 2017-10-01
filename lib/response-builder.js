class ResponseBuilder {
  constructor(time = process.hrtime()) {
    this._response = {}
    this._time = {}

    this._hrtime = time
  }

  exec(pending) {
    return this._handlePromise(pending, 'exec', response => response.stdout, this._formatExecResponse)
  }

  download(pending) {
    return this._handlePromise(pending, 'download', response => response.data || response, this._formatStorageResponse)
  }

  upload(pending) {
    return this._handlePromise(pending, 'upload', response => response.data || response, this._formatStorageResponse)
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
          this._registerResponse(formatter(null, response), key)
          resolve(responseMapper(response))
        })
        .catch(error => {
          console.log(key + ' failure: ' + error)
          this._registerResponse(formatter(error), key)
          reject()
        })
    })
  }

  _registerResponse(response, key) {
    this._hrtime = process.hrtime(this._hrtime)
    this._response[key] = response
    this._time[key] = this._hrtime
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
      error: error,
      size: response.size
    }
  }
}

module.exports = ResponseBuilder
