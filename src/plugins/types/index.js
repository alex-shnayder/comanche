const { next } = require('hooter/effects')
const validators = require('./validators')
const coercers = require('./coercers')


function modifyOptions(options) {
  return options.map((option) => {
    let { type, validate, coerce } = option

    if (!type || (validate && coerce)) {
      return option
    }

    validate = validators[type]
    coerce = coercers[type]

    return Object.assign({ validate, coerce }, option)
  })
}

module.exports = function typesPlugin(lifecycle) {
  lifecycle.hook('configure', function* (_, config, ...args) {
    let options = config.options

    if (!options) {
      return yield next(_, config, ...args)
    }

    options = modifyOptions(options)
    config = Object.assign({}, config, { options })
    return yield next(_, config, ...args)
  })
}
