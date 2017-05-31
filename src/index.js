const comanche = require('./comanche')
const api = require('./plugins/api')
const cli = require('./plugins/cli')
const execution = require('./plugins/execution')
const version = require('./plugins/version')
const help = require('./plugins/help')
const validation = require('./plugins/validation')
const coerce = require('./plugins/coerce')
const canonize = require('./plugins/canonize')
const camelCase = require('./plugins/camelCase')
const error = require('./plugins/error')
const sharedOptions = require('./plugins/sharedOptions')


const DEFAULT_PLUGINS = [
  error, execution, api, cli, sharedOptions,
  version, help, coerce, validation, camelCase, canonize,
]

module.exports = function defaultComanche(...args) {
  let plugins = DEFAULT_PLUGINS

  if (Array.isArray(args[args.length - 1])) {
    plugins = plugins.concat(args.pop())
  }

  return comanche(args, plugins)
}
