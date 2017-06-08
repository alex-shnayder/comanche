const { findOneByAliases, populateCommand } = require('../../common')


function validateCommand(command) {
  let { commands, options } = command

  if (commands && commands.length) {
    commands.forEach((command) => {
      let { name, aliases } = command
      let names = aliases ? aliases.concat(name) : [name]
      let matchingCommand = findOneByAliases(commands, names)

      if (matchingCommand && matchingCommand !== command) {
        throw new Error(
          `The command "${name}" has a name or alias ` +
          `that is already taken by "${matchingCommand.name}"`
        )
      }
    })
  }

  if (options && options.length) {
    options.forEach((option) => {
      let { name, aliases } = option
      let names = aliases ? aliases.concat(name) : [name]
      let matchingOption = findOneByAliases(options, names)

      if (matchingOption && matchingOption !== option) {
        throw new Error(
          `The option "${name}" has a name or alias ` +
          `that is already taken by "${matchingOption.name}"`
        )
      }
    })
  }
}

function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Config must be an object')
  }

  let { commands, options } = config

  if (!commands || !Array.isArray(commands)) {
    throw new Error('Config must contain an array of commands')
  }

  if (options && !Array.isArray(options)) {
    throw new Error('The options in config must be an array')
  }

  commands.forEach((command) => {
    command = populateCommand(command, config)
    validateCommand(command)
  })
}


module.exports = validateConfig
