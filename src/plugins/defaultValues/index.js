const { next } = require('hooter/effects')
const extendApi = require('./extendApi')


module.exports = function defaultValuesPlugin(lifecycle) {
  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hookStart('process', function* (_, command, ...args) {
    let config = command.config

    if (!config || !config.options || !config.options.length) {
      return yield next(_, command, ...args)
    }

    let options = command.options.slice()

    config.options.forEach((optionConfig) => {
      if (typeof optionConfig.default === 'undefined') {
        return
      }

      let optionIndex = options.findIndex((o) => {
        return o.config && o.config.id === optionConfig.id
      })
      let option = options[optionIndex]

      if (option && typeof option.value === 'undefined') {
        options[optionIndex] = Object.assign({}, option, {
          value: optionConfig.default,
        })
      } else if (!option) {
        options.push({
          name: optionConfig.name,
          inputName: optionConfig.name,
          value: optionConfig.default,
          config: optionConfig,
        })
      }
    })

    command = Object.assign({}, command, { options })
    return yield next(_, command, ...args)
  })
}
