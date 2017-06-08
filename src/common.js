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

function findOneByAliases(items, names) {
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

function findOneByName(items, field, name) {
  if (arguments.length === 2) {
    return findOneByAliases(items, field)
  } else if (typeof name === 'string') {
    return findOneByAliases(items, name)
  }

  let result

  for (let i = 0; i < name.length && items.length; i++) {
    result = findOneByName(items, name[i])

    if (result) {
      items = findByIds(items, result[field])
    }
  }

  return result
}

function findCommandByFullName(config, name, populate) {
  let command = findOneByName(config.commands, 'commands', name)

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
  InputError, findByIds, findOneById, findOneByAliases, findOneByName,
  findDefaultCommand, findCommandByFullName, populateCommand, optionsToObject,
  compareNames, getCommandFromEvent,
}
