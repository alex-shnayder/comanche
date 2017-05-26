const camelcase = require('camelcase')
const { next } = require('hooter/effects')

module.exports = function camelCasePlugin(lifecycle) {
  lifecycle.hookAfter('execute', function* (commands) {
    commands = commands.map((command) => {
      if (command.options) {
        command = Object.assign({}, command)
        command.options = command.options.map((option) => {
          if (option.outputName) {
            option = Object.assign({}, option, {
              outputName: camelcase(option.outputName),
            })
          }
          return option
        })
      }

      return command
    })

    return yield next(commands)
  })
}
