const { next } = require('hooter/effects')
const assignDefaults = require('./assignDefaults')
const validateConfig = require('./validateConfig')


const EVENTS_WITH_CONFIG = ['start', 'execute', 'process', 'handle', 'error']


module.exports = function configurePlugin(lifecycle) {
  let schema, config

  lifecycle.hookEnd('schema', function* (_schema) {
    schema = yield next(_schema).or(_schema)
    return schema
  })

  lifecycle.hookStart('configure', function* (_config) {
    return yield next(schema, _config)
  })

  lifecycle.hook('configure', function* (_schema, _config) {
    _config = assignDefaults(_schema, _config)
    return yield next(_schema, _config)
  })

  lifecycle.hookEnd('configure', function* (_schema, _config) {
    validateConfig(_schema, _config)
    config = yield next(_schema, _config).or(_config)
    return config
  })

  EVENTS_WITH_CONFIG.forEach((event) => {
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
