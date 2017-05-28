/* eslint-disable no-console */

const { next } = require('hooter/effects')
const { InputError } = require('../../common')
const parseArgs = require('./parseArgs')
const extendApi = require('./extendApi')


function handleError(err) {
  if (err instanceof InputError) {
    console.error(err.message)
  } else {
    console.error(err)
  }
}

function handleResult(result) {
  if (result) {
    console.log(result)
  }
}

module.exports = function cliPlugin(lifecycle) {
  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hook('start', function* (config) {
    config = yield next(config)

    Promise.resolve()
      .then(() => {
        let args = process.argv.slice(2)
        let commands = parseArgs(args, config)
        return lifecycle.tootAsync('execute', commands, handleError)
      })
      .then(handleResult)

    return config
  })
}
