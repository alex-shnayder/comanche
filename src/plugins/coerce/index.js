const { next, hook } = require('hooter/effects')
const modifySchema = require('./modifySchema')


function coerceOption(option) {
  let { config, value } = option

  if (!config || !config.coerce) {
    return option
  }

  value = config.coerce(value)
  return Object.assign({}, option, { value })
}

module.exports = function* coercePlugin() {
  yield hook('schema', function* (schema) {
    schema = modifySchema(schema)
    return yield next(schema)
  })

  yield hook('process', function* (_, command, ...args) {
    let options = command.options

    if (options) {
      command = Object.assign({}, command)
      command.options = options.map((option) => coerceOption(option))
    }

    return yield next(_, command, ...args)
  })
}
