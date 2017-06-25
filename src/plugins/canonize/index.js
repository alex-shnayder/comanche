const { next, hookEnd, call } = require('hooter/effects')


function canonize(command) {
  let { fullName, config, options } = command

  if (config) {
    command = Object.assign({}, command)
    command.outputName = fullName.slice(0, -1).concat(config.name)
  }

  if (options && options.length) {
    command = config ? command : Object.assign({}, command)
    command.options = options.map((option) => {
      if (!option.config) {
        return option
      }

      return Object.assign({}, option, {
        outputName: option.config.name,
      })
    })
  }

  return command
}

function* processHandler(_, command, ...args) {
  command = yield call(canonize, command)
  return yield next(_, command, ...args)
}

module.exports = function* canonizePlugin() {
  yield hookEnd('process', processHandler)
}
