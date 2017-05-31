const { next } = require('hooter/effects')


function coerceValue(value, type) {
  switch (type) {
    case 'boolean':
      return (value === null) ? true : Boolean(value)

    case 'number':
      return Number(value)
  }

  return value
}

module.exports = function coercePlugin(lifecycle) {
  lifecycle.hook('execute.batch', function* (commands) {
    commands = commands.map((command) => {
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

      return command
    })

    return yield next(commands)
  })
}
