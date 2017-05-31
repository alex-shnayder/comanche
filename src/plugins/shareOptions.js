const { next } = require('hooter/effects')


function shareOptions(commands) {
  let providedOptionsById = {}

  commands.forEach(({ options }) => {
    if (options) {
      options.forEach((option) => {
        if (option.config) {
          providedOptionsById[option.config.id] = option
        }
      })
    }
  })

  return commands.map((command) => {
    if (!command.config || !command.config.options) {
      return command
    }

    command = Object.assign({}, command)
    command.config.options.forEach(({ id }) => {
      let providedOption = providedOptionsById[id]

      if (providedOption) {
        let option = command.options && command.options.find((o) => {
          return o.config && o.config.id === id
        })

        if (!option) {
          command.options.push(providedOption)
        }
      }
    })

    return command
  })
}


module.exports = function shareOptionsPlugin(lifecycle) {
  lifecycle.hook('execute.batch', function* (commands) {
    commands = shareOptions(commands)
    return yield next(commands)
  })
}
