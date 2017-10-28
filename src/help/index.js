const { next, preHook, hook } = require('appache/effects')
const { createOption, Help } = require('appache/common')
const modifySchema = require('./modifySchema')


let optionCounter = 0

// Multiple options are required because otherwise a single option would be
// shared between commands and it would be impossible to determine which
// command in a request it was specified for
function createHelpOption(schema) {
  return createOption(schema, {
    id: `help${++optionCounter}`,
    name: 'help',
    aliases: ['h'],
    description: 'Show help',
    type: 'boolean',
    isHelpOption: true, // Probably not the best way to identify the options
  })
}

function injectOptions(schema, config) {
  let helpOptions = []
  let commands = config.commands && config.commands.map((command) => {
    let { help, options } = command

    if (!help) {
      return command
    }

    let option = createHelpOption(schema)
    helpOptions.push(option)
    options = options ? options.concat(option.id) : [option.id]
    return Object.assign({}, command, { options })
  })

  if (!helpOptions.length) {
    return config
  }

  let options = config.options ?
    config.options.concat(helpOptions) :
    helpOptions
  return Object.assign({}, config, { commands, options })
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
    tags: ['modifyCommandConfig', 'createOptionConfig'],
  }, (schema, config) => {
    config = injectOptions(schema, config)
    return [schema, config]
  })

  yield hook({
    event: 'process',
    tags: ['handleCommand'],
  }, function* (_, command) {
    let isHelpAsked = command.options && command.options.some((option) => {
      return option.config && option.config.isHelpOption
    })

    if (isHelpAsked) {
      return new Help()
    }

    return yield next(_, command)
  })
}
