const { next } = require('hooter/effects')


const TRUTHY_VALUES = [null, true, 'true', 1, '1']
const FALSY_VALUES = [false, 'false', 0, '0']


function coerceValue(value, type) {
  switch (type) {
    case 'string':
      return (typeof value === 'number') ? String(value) : value

    case 'boolean':
      if (TRUTHY_VALUES.includes(value)) {
        return true
      } else if (FALSY_VALUES.includes(value)) {
        return false
      }
      break

    case 'number': {
      let newValue = (value === null) ? 1 : Number(value)
      return Number.isNaN(newValue) ? value : newValue
    }
  }

  return value
}

module.exports = function coercePlugin(lifecycle) {
  lifecycle.hook('process', function* (_, command, ...args) {
    if (command.options) {
      command = Object.assign({}, command)
      command.options = command.options.map((option) => {
        if (option.config && option.config.type) {
          option = Object.assign({}, option)
          option.value = coerceValue(option.value, option.config.type)
        }
        return option
      })
    }

    return yield next(_, command, ...args)
  })
}
