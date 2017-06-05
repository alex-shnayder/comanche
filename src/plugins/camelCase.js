const camelcase = require('camelcase')
const { next } = require('hooter/effects')


module.exports = function camelCasePlugin(lifecycle) {
  lifecycle.hookEnd('process', function* (command) {
    if (command.options) {
      command = Object.assign({}, command)
      command.options = command.options.map((option) => {
        if (option.outputName && option.config) {
          option = Object.assign({}, option, {
            outputName: camelcase(option.outputName),
          })
        }
        return option
      })
    }

    return yield next(command)
  })
}
