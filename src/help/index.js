const { next, preHook, hook } = require('appache/effects')
const { injectOption, Help } = require('appache/common')
const modifySchema = require('./modifySchema')


const OPTION = {
  id: 'help',
  name: 'help',
  aliases: ['h'],
  description: 'Show help',
  type: 'boolean',
}


function addOptionToCommands(schema, config) {
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
    event: 'schematize',
    tags: ['modifyCommandSchema'],
  }, (schema) => {
    schema = modifySchema(schema)
    return [schema]
  })

  yield preHook({
    event: 'configure',
    tags: ['createOptionConfig'],
  }, (schema, config) => {
    config = injectOption(config, OPTION)
    return [schema, config]
  })

  yield preHook({
    event: 'configure',
    tags: ['modifyCommandConfig'],
    goesAfter: ['modifyCommandConfig'],
  }, (schema, config) => {
    config = addOptionToCommands(schema, config)
    return [schema, config]
  })

  yield hook({
    event: 'execute',
    tags: ['handleBatch'],
  }, function* (config, batch) {
    for (let i = 0; i < batch.length; i++) {
      let isHelpAsked = batch[i].options && batch[i].options.some((option) => {
        return option.config && option.config.id === OPTION.id
      })

      if (isHelpAsked) {
        return new Help(batch[i])
      }
    }

    return yield next(config, batch)
  })
}
