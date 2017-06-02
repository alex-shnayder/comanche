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

function findDefaultCommand(config, populate) {
  if (!config || !config.commands) {
    return
  }

  let command = config.commands.find((c) => c.default)

  if (command && populate) {
    return populateCommand(command, config)
  }

  return command
}

function populateCommand(command, config) {
  let { options, commands } = command

  if (!options && !commands) {
    return command
  }

  return Object.assign({}, command, {
    options: options && findByIds(config.options, options),
    commands: commands && findByIds(config.commands, commands),
  })
}

module.exports = {
  InputError, findByIds, findOneById, findOneByAliases,
  findOneByName, findDefaultCommand, populateCommand,
}
