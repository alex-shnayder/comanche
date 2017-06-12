const { next } = require('hooter/effects')
const readPkgUp = require('read-pkg-up')
const modifySchema = require('./modifySchema')


const OPTION = {
  id: 'version',
  name: 'version',
  aliases: ['v'],
  description: 'Show the current version',
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

function injectOptions(config) {
  let needsVersionOption = false
  let commands = config.commands.map((command) => {
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

  let options = config.options ? config.options.concat(OPTION) : [OPTION]
  return Object.assign({}, config, { commands, options })
}

module.exports = function versionPlugin(lifecycle) {
  lifecycle.hook('schema', function* (schema) {
    schema = modifySchema(schema)
    return yield next(schema)
  })

  lifecycle.hook('configure', function* (config, ...args) {
    config = injectOptions(config)
    return yield next(config, ...args)
  })

  lifecycle.hookEnd('process', function* (_, command, ...args) {
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
