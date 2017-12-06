const readPkgUp = require('read-pkg-up')
const { next, preHook, hook } = require('appache/effects')
const { Result, createOption } = require('appache/common')
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

function injectOption(schema, config) {
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
    event: 'schema',
    tags: ['modifySchema', 'modifyCommandSchema'],
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
    let { options, config } = command

    let isVersionAsked = options && options.some((option) => {
      return option.config && option.config.id === OPTION.id
    })

    if (!isVersionAsked) {
      return yield next(_, command)
    }

    let version = config && config.version
    version = (version === true) ? detectVersion() : version

    if (version && version.charAt(0) !== 'v') {
      version = `v${version}`
    } else if (!version) {
      version = 'Unable to determine the current version'
    }

    return new Result(version)
  })
}
