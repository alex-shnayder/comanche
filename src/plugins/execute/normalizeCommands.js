const { findOneByNames, findCommandByFullName } = require('../../common')


module.exports = function normalizeCommands(commands, config) {
  return commands.map((command) => {
    if (!command || typeof command !== 'object') {
      throw new Error('A command must be an object')
    }

    let { fullName, options } = command

    if (!fullName || !fullName.length) {
      throw new Error('A command must have a full name')
    }

    if (typeof fullName === 'string') {
      fullName = [fullName]
    } else if (!Array.isArray(fullName)) {
      throw new Error('A command\'s fullName must be an array or a string')
    }

    let commandConfig = findCommandByFullName(config, fullName, true)
    let inputName = command.inputName || fullName[fullName.length - 1]
    let newCommand = Object.assign({}, command, {
      fullName, inputName, config: commandConfig,
    })

    if (!options) {
      return newCommand
    }

    if (!Array.isArray(options)) {
      throw new Error('Options must be an array')
    }

    options.forEach((option) => {
      if (!option || typeof option !== 'object') {
        throw new Error('An option must be an object')
      }

      if (!option.name || typeof option.name !== 'string') {
        throw new Error('An option must have a name')
      }
    })

    if (commandConfig) {
      newCommand.options = options.map((option) => {
        let optionConfig = findOneByNames(commandConfig.options, option.name)
        let inputName = option.inputName || option.name
        let inputValue = option.value
        return Object.assign({}, option, {
          inputName, inputValue, config: optionConfig,
        })
      })
    }

    return newCommand
  })
}
