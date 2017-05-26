const { next } = require('hooter/effects')
const { InputError } = require('../../common')
const parseArgs = require('./parseArgs')
const extendApi = require('./extendApi')


function showError(err) {
  // eslint-disable-next-line
  console.error(err.message)
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
        return lifecycle.tootAsync('execute', commands)
      })
      .catch((err) => {
        if (err instanceof InputError) {
          return showError(err)
        }

        throw err
      })

    return config
  })
}
