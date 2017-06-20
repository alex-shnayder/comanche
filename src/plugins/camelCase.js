const camelcase = require('camelcase')
const { next, hookEnd } = require('hooter/effects')


module.exports = function* camelCasePlugin() {
  yield hookEnd('process', function* (_, command, ...args) {
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

    return yield next(_, command, ...args)
  })
}
