const { next } = require('hooter/effects')
const parseArgs = require('./parseArgs')
const extendApi = require('./extendApi')

module.exports = function cliPlugin(lifecycle) {
  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hook('start', function* (config) {
    config = yield next(config)

    let args = process.argv.slice(2)
    let commands = parseArgs(args, config)
    lifecycle.tootAsync('execute', commands)

    return config
  })
}
