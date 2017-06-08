const { next } = require('hooter/effects')
const validateConfig = require('./validateConfig')


const EVENTS = ['start', 'execute', 'process', 'handle', 'error']


module.exports = function configurePlugin(lifecycle) {
  let config

  lifecycle.hookEnd('configure', function* (_config) {
    config = yield next(_config).or(_config)
    validateConfig(config)
    return config
  })

  EVENTS.forEach((event) => {
    lifecycle.hookStart(event, function* (...args) {
      if (!config) {
        throw new Error(
          `The config must already be defined at the beginning of "${event}"`
        )
      }

      return yield next(config, ...args)
    })
  })
}
