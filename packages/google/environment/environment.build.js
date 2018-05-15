const STAGE = '${env:SLS_STAGE}'
const fs = require('fs')
const config = require('js-yaml').load(fs.readFileSync(`environment/${STAGE}.yml`))

module.exports = () => {
  return Object.assign({}, config, {stage: STAGE})
}
