const { next, hookEnd, call } = require('hooter/effects')
const { findOneByNames, findByIds } = require('../../common')


function canonizeCommandName(config, fullName) {
  let allCommands = config.commands
  let commands = allCommands
  let newName = fullName.slice()

  for (let i = 0; i < fullName.length; i++) {
    let name = fullName[i]
    let command = findOneByNames(commands, name)

    if (!command) {
      return newName
    }

    newName[i] = command.name

    if (!command.commands) {
      return newName
    }

    commands = findByIds(allCommands, command.commands)
  }

  return newName
}

function canonize(config, command) {
  let { fullName, options } = command

  command = Object.assign({}, command)
  command.fullName = canonizeCommandName(config, fullName)

  if (options && options.length) {
    command.options = options.map((option) => {
      if (!option.config) {
        return option
      }

      option = Object.assign({}, option)
      option.name = option.config.name
      return option
    })
  }

  return command
}

function* processHandler(config, command, ...args) {
  command = yield call(canonize, config, command)
  return yield next(config, command, ...args)
}

module.exports = function* canonizePlugin() {
  yield hookEnd('process', processHandler)
}
