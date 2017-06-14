const { next } = require('hooter/effects')
const validateConfig = require('./validateConfig')


const EVENTS = ['start', 'execute', 'process', 'handle', 'error']


module.exports = function configurePlugin(lifecycle) {
  let schema, config

  lifecycle.hookEnd('schema', function* (_schema) {
    schema = yield next(_schema).or(_schema)
    return schema
  })

  lifecycle.hookEnd('configure', function* (_config) {
    validateConfig(schema, _config)
    config = yield next(_config).or(_config)
    return config
  })

  EVENTS.forEach((event) => {
    lifecycle.hookStart(event, function* (...args) {
      if (!config && event !== 'error') {
        throw new Error(
          `The config must already be defined at the beginning of "${event}"`
        )
      }

      return yield next(config, ...args)
    })
  })
}
