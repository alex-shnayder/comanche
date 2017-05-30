const { findOneByName, findByIds } = require('../../common')


module.exports = function normalizeCommands(commands, config) {
  return commands.map((command) => {
    if (!command || typeof command !== 'object') {
      throw new Error('A command must be an object')
    }

    let { name, options } = command

    if (typeof name === 'string') {
      if (!name.length) {
        throw new Error('A command name must not be empty')
      }

      name = [name]
    } else if (!Array.isArray(name)) {
      throw new Error('A command name must be an array or a string')
    }

    let commandConfig = findOneByName(config.commands, 'commands', name)

    if (commandConfig.options || commandConfig.commands) {
      let { options, commands } = commandConfig

      commandConfig = Object.assign({}, commandConfig, {
        options: options && findByIds(config.options, options),
        commands: commands && findByIds(config.commands, commands),
      })
    }

    let inputName = command.inputName || name[name.length - 1]
    let newCommand = Object.assign({}, command, {
      name, inputName, config: commandConfig,
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
        let optionConfig = findOneByName(commandConfig.options, option.name)
        let inputName = option.inputName || option.name
        return Object.assign({}, option, { inputName, config: optionConfig })
      })
    }

    return newCommand
  })
}
