const exec = require('child_process').exec

function execToPromise(path) {
  return new Promise((resolve, reject) => {
    exec(path, (err, stdout, stderr) => {
      if (err) reject({err, stderr, stdout})
      else resolve({stdout})
    })
  })
}

module.exports = execToPromise
