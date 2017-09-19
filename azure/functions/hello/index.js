const exec = require('child_process').exec
const bluebird = require('bluebird')
const azure = bluebird.promisifyAll(require('azure-storage'))

const TASK_CONTAINER = 'serverlessrandom'

function fileName() {
  return `/random_${(new Date()).toISOString()}.txt`
}
module.exports.hello = function (context, req) {
  const t = process.hrtime()

  exec(__dirname + '\\hello.exe', function (error, stdout, stderr) {
    const t2 = process.hrtime(t)
    const execError = error

    const storageAccount = process.env.AZURE_STORAGE_ACCOUNT
    const storageAccessKey = process.env.AZURE_STORAGE_ACCESS_KEY

    const blobService = azure.createBlobService(storageAccount, storageAccessKey)
    blobService.createContainerIfNotExistsAsync(TASK_CONTAINER, {
      publicAccessLevel: 'blob'
    })
      .then(() =>
        blobService.createBlockBlobFromTextAsync(TASK_CONTAINER, fileName(), stdout)
      )
      .then(() => {
        const t3 = process.hrtime(t2)

        context.res = {
          ts: (new Date()).toString(),
          exec: {'stdout': stdout, 'stderr': stderr, 'error': execError},
          time: {
            exec: [t2[0], t2[1]],
            upload: [t3[0], t3[1]]
          }
        }
        context.done()
      })
      .catch(error => {
        context.res = {
          ts: (new Date()).toString(),
          exec: {'stdout': stdout, 'stderr': stderr, 'error': execError},
          upload: {'error': error},
          time: {
            exec: [t2[0], t2[1]]
          }
        }
        context.done()
      })
  })
}


