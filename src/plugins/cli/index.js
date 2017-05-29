const { next } = require('hooter/effects')
const { InputError } = require('../../common')
const parseArgs = require('./parseArgs')
const extendApi = require('./extendApi')


function handleError(err) {
  /* eslint-disable no-console */

  if (err instanceof InputError) {
    console.error(err.message)
  } else {
    console.error(err)
  }
}

function handleResult(result) {
  /* eslint-disable no-console */

  if (typeof result === 'string') {
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
        return parseArgs(args, config)
      })
      .then((commands) => {
        return lifecycle.toot('execute', commands, handleError)
      }, (err) => {
        return lifecycle.tootSyncWith('error', handleError, err)
      })
      .then(handleResult)

    return config
  })
}
