const { next, preHook, hook } = require('appache/effects')
const { createOption, Help } = require('appache/common')
const modifySchema = require('./modifySchema')


const OPTION = {
  id: 'help',
  name: 'help',
  aliases: ['h'],
  description: 'Show help',
  type: 'boolean',
}


function injectOption(schema, config) {
  let commandsChanged = false
  let commands = config.commands && config.commands.map((command) => {
    let { help, options } = command

    if (!help) {
      return command
    }

    commandsChanged = true
    options = options ? options.concat(OPTION.id) : [OPTION.id]
    return Object.assign({}, command, { options })
  })

  if (commandsChanged) {
    config = Object.assign({}, config, { commands })
  }

  return config
}

module.exports = function* help() {
  yield preHook({
    event: 'schema',
    tags: ['modifyCommandSchema'],
  }, (schema) => {
    schema = modifySchema(schema)
    return [schema]
  })

  yield preHook({
    event: 'config',
    tags: ['createOptionConfig'],
  }, (schema, config) => {
    config = createOption(config, OPTION)
    return [schema, config]
  })

  yield preHook({
    event: 'config',
    tags: ['modifyCommandConfig'],
    goesAfter: ['modifyCommandConfig'],
  }, (schema, config) => {
    config = injectOption(schema, config)
    return [schema, config]
  })

  yield hook({
    event: 'process',
    tags: ['handleCommand'],
  }, function* (_, command) {
    let isHelpAsked = command.options && command.options.some((option) => {
      return option.config && option.config.id === OPTION.id
    })

    if (isHelpAsked) {
      return new Help()
    }

    return yield next(_, command)
  })
}
