const { next, hook, hookStart, hookEnd } = require('hooter/effects')
const assignDefaults = require('./assignDefaults')
const validateConfig = require('./validateConfig')


const EVENTS_WITH_CONFIG = ['start', 'execute', 'process', 'handle', 'error']


module.exports = function* configurePlugin() {
  let schema, config

  function* provideConfig(...args) {
    let event = this.type

    if (!config && event !== 'error') {
      throw new Error(
        `The config must already be defined at the beginning of "${event}"`
      )
    }

    return yield next(config, ...args)
  }

  yield hookEnd('schema', function* (_schema) {
    schema = yield next(_schema).or(_schema)
    return schema
  })

  yield hookStart('configure', function* (_config) {
    return yield next(schema, _config)
  })

  yield hook('configure', function* (_schema, _config) {
    _config = assignDefaults(_schema, _config)
    return yield next(_schema, _config)
  })

  yield hookEnd('configure', function* (_schema, _config) {
    validateConfig(_schema, _config)
    config = yield next(_schema, _config).or(_config)
    return config
  })

  for (let event of EVENTS_WITH_CONFIG) {
    yield hookStart(event, provideConfig)
  }
}
