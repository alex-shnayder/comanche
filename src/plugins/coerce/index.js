const { next } = require('hooter/effects')
const extendApi = require('./extendApi')


function coerceOption(option) {
  let { config, value } = option

  if (!config || !config.coerce) {
    return option
  }

  value = config.coerce(value)
  return Object.assign({}, option, { value })
}

module.exports = function coercePlugin(lifecycle) {
  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hook('process', function* (_, command, ...args) {
    let options = command.options

    if (options) {
      command = Object.assign({}, command)
      command.options = options.map((option) => coerceOption(option))
    }

    return yield next(_, command, ...args)
  })
}
