const objectPathImmutable = require('object-path-immutable')


class InputError extends Error {}

function findByIds(items, ids) {
  return ids
    .map((id) => {
      return items.find((item) => item.id === id)
    })
    .filter((item) => item)
}

function findOneById(items, id) {
  return items.find((item) => item.id === id)
}

function findOneByNames(items, names) {
  if (Array.isArray(names)) {
    return items.find((item) => {
      let { name, aliases } = item
      return names.find((n) => n === name || (aliases && aliases.includes(n)))
    })
  }

  return items.find((item) => {
    return item.name === names || (item.aliases && item.aliases.includes(names))
  })
}

function findCommandById(config, id, populate) {
  let { commands } = config

  if (!commands || !commands.length) {
    return
  }

  let command = findOneById(commands, id)

  if (command && populate) {
    return populateCommand(config, command)
  }
}

function findOptionById(config, id) {
  let { options } = config

  if (options && options.length) {
    return findOneById(options, id)
  }
}

function findCommandByFullName(config, fullName, populate) {
  let commands = config.commands || []
  let command

  for (let i = 0; i < fullName.length && commands.length; i++) {
    command = findOneByNames(commands, fullName[i])

    if (command) {
      commands = findByIds(commands, command.commands)
    }
  }

  if (command && populate) {
    command = populateCommand(config, command)
  }

  return command
}

function findDefaultCommand(config, populate) {
  if (!config || !config.commands) {
    return
  }

  let command = config.commands.find((c) => c.default)

  if (command && populate) {
    return populateCommand(config, command)
  }

  return command
}

function populateCommand(config, command) {
  let { options, commands } = command

  if (!options && !commands) {
    return command
  }

  return Object.assign({}, command, {
    options: options && findByIds(config.options, options),
    commands: commands && findByIds(config.commands, commands),
  })
}

function updateCommandById(config, id, command, overwrite) {
  let { commands } = config

  if (!commands || !commands.length) {
    throw new Error('Config doesn\'t have any commands')
  }

  let updatedCommands = []
  let commandFound = false

  for (let i = 0; i < commands.length; i++) {
    if (commands[i].id === id) {
      commandFound = true
      updatedCommands[i] = overwrite ?
        command :
        Object.assign({}, commands[i], command)
    } else {
      updatedCommands[i] = commands[i]
    }
  }

  if (!commandFound) {
    throw new Error(`Command "${id}" is not found`)
  }

  return Object.assign({}, config, {
    commands: updatedCommands,
  })
}

function updateOptionById(config, id, option, overwrite) {
  let { options } = config

  if (!options || !options.length) {
    throw new Error('Config doesn\'t have any options')
  }

  let updatedOptions = []
  let optionFound = false

  for (let i = 0; i < options.length; i++) {
    if (options[i].id === id) {
      optionFound = true
      updatedOptions[i] = overwrite ?
        option :
        Object.assign({}, options[i], option)
    } else {
      updatedOptions[i] = options[i]
    }
  }

  if (!optionFound) {
    throw new Error(`option "${id}" is not found`)
  }

  return Object.assign({}, config, {
    options: updatedOptions,
  })
}

function optionsToObject(options) {
  if (!options || !options.length) {
    return {}
  }

  return options.reduce((object, option) => {
    object[option.outputName] = option.value
    return object
  }, {})
}

function compareNames(nameA, nameB) {
  nameA = (typeof nameA === 'string') ? [nameA] : nameA
  nameB = (typeof nameB === 'string') ? [nameB] : nameB

  if (!Array.isArray(nameA) || !Array.isArray(nameB)) {
    throw new Error('A name must be an array or a string')
  }

  return (nameA.length === nameB.length &&
          nameA.every((n, i) => nameB[i] === n))
}

function getCommandFromEvent(event) {
  let { args, type } = event

  if (type === 'execute') {
    return args && args[0] && args[0][0]
  } else if (type === 'process' || type === 'handle') {
    return args && args[0]
  }
}


module.exports = {
  InputError, findByIds, findOneById, findOneByNames, findCommandById,
  findOptionById, findCommandByFullName, findDefaultCommand, populateCommand,
  updateCommandById, updateOptionById, optionsToObject, compareNames,
  getCommandFromEvent,
}

Object.assign(module.exports, objectPathImmutable)
