const readPkgUp = require('read-pkg-up')
const { next, preHook, hook } = require('appache/effects')
const { injectOption, Result } = require('appache/common')
const modifySchema = require('./modifySchema')


const OPTION = {
  id: 'version',
  name: 'version',
  aliases: ['v'],
  description: 'Show current version',
  type: 'boolean',
}


let detectedVersion

function detectVersion() {
  if (typeof detectedVersion !== 'undefined') {
    return detectedVersion
  }

  let { pkg } = readPkgUp.sync({
    cwd: process.argv[1],
  })
  detectedVersion = pkg.version
  return pkg.version
}

function addOptionToCommands(schema, config) {
  let commandsChanged = false
  let commands = config.commands && config.commands.map((command) => {
    let { version, options } = command

    if (!version) {
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

module.exports = function* version() {
  yield preHook({
    event: 'schematize',
    tags: ['modifySchema', 'modifyCommandSchema'],
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
      let { options, config } = batch[i]

      let isVersionAsked = options && options.some((option) => {
        return option.config && option.config.id === OPTION.id
      })

      if (isVersionAsked) {
        let version = config && config.version
        version = (version === true) ? detectVersion() : version

        if (version && version.charAt(0) !== 'v') {
          version = `v${version}`
        } else if (!version) {
          version = 'Unable to determine the current version'
        }

        return new Result(version, batch[i])
      }
    }

    return yield next(config, batch)
  })
}
