const { next } = require('hooter/effects')

module.exports = function canonizePlugin(lifecycle) {
  lifecycle.hookAfter('execute.batch', function* (commands) {
    commands = commands.map((command) => {
      if (command.options) {
        command = Object.assign({}, command)
        command.options = command.options.map((option) => {
          let outputName = option.config ? option.config.name : option.name
          return Object.assign({}, option, { outputName })
        })
      }

      return command
    })

    return yield next(commands)
  })
}
