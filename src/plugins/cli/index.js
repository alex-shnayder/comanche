const { next } = require('hooter/effects')
const parseArgs = require('./parseArgs')

module.exports = function cliPlugin(lifecycle) {
  lifecycle.hook('start', function* (config) {
    yield next(config)

    let args = process.argv.slice(2)
    let commands = parseArgs(args, config)
    lifecycle.tootAsync('run', commands)
  })
}
