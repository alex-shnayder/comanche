const { next } = require('hooter/effects')
const readPkgUp = require('read-pkg-up')
const extendApi = require('./extendApi')


const OPTION = {
  id: 'version',
  name: 'version',
  aliases: ['v'],
  description: 'Show the current version',
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
  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hook('start', function* (config, ...args) {
    config = injectOptions(config)
    return yield next(config, ...args)
  })

  lifecycle.hookAfter('execute.batch', function* (commands) {
    for (let i = 0; i < commands.length; i++) {
      let command = commands[i]
      let options = command.options

      if (!options) {
        continue
      }

      let isVersionAsked = options.some((option) => {
        return option.config && option.config.id === OPTION.id
      })

      if (!isVersionAsked) {
        continue
      }

      let version = command.config.version
      version = (version === true) ? detectVersion() : version

      if (version) {
        return (version.charAt(0) === 'v') ? version : `v${version}`
      } else {
        return 'Unable to determine the current version'
      }
    }

    return yield next(commands)
  })
}
