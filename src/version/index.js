const readPkgUp = require('read-pkg-up')
const { next, preHook, hook } = require('appache/effects')
const { createOption } = require('appache/common')
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

function injectOptions(schema, config) {
  let needsVersionOption = false
  let commands = config.commands && config.commands.map((command) => {
    let { version, options } = command

    if (!version) {
      return command
    }

    needsVersionOption = true
    options = options ? options.concat(OPTION.id) : [OPTION.id]
    return Object.assign({}, command, { options })
  })

  if (!needsVersionOption) {
    return config
  }

  let option = createOption(schema, OPTION)
  let options = config.options ? config.options.concat(option) : [option]
  return Object.assign({}, config, { commands, options })
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
    tags: ['modifyCommandConfig', 'createOptionConfig'],
    // It should be `goesAfter: ['modifyCommandConfig'] to ensure that
    // the option will be among the last ones to be added to a command, but then
    // it conflicts with the core config plugin. As a workaround, this ensures
    // that the option is *created* after all the others. It will break if
    // another option is first created and then added in separate handlers.
    goesAfter: ['createOptionConfig'],
  }, (schema, config, ...args) => {
    config = injectOptions(schema, config)
    return [schema, config, ...args]
  })

  yield hook({
    event: 'process',
    tags: ['handleCommand'],
  }, function* (_, command, ...args) {
    let { options, config } = command

    let isVersionAsked = options && options.some((option) => {
      return option.config && option.config.id === OPTION.id
    })

    if (!isVersionAsked) {
      return yield next(_, command, ...args)
    }

    let version = config && config.version
    version = (version === true) ? detectVersion() : version

    if (version) {
      return (version.charAt(0) === 'v') ? version : `v${version}`
    } else {
      return 'Unable to determine the current version'
    }
  })
}
