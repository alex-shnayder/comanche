const camelcase = require('camelcase')
const { next, hookEnd, call } = require('hooter/effects')


function camelizeOptions(command) {
  if (!command.options) {
    return command
  }

  command = Object.assign({}, command)
  command.options = command.options.map((option) => {
    if (option.outputName) {
      option = Object.assign({}, option, {
        outputName: camelcase(option.outputName),
      })
    }
    return option
  })

  return command
}

function* processHandler(_, command, ...args) {
  command = yield call(camelizeOptions, command)
  return yield next(_, command, ...args)
}

module.exports = function* camelCasePlugin() {
  yield hookEnd('process', processHandler)
}
