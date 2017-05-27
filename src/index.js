const comanche = require('./comanche')
const api = require('./plugins/api')
const cli = require('./plugins/cli')
const execution = require('./plugins/execution')
const version = require('./plugins/version')
const validation = require('./plugins/validation')
const canonize = require('./plugins/canonize')
const camelCase = require('./plugins/camelCase')
const error = require('./plugins/error')

const DEFAULT_PLUGINS = [
  error, execution, api, cli, version, validation, camelCase, canonize,
]

module.exports = function defaultComanche(...args) {
  let plugins = DEFAULT_PLUGINS

  if (Array.isArray(args[args.length - 1])) {
    plugins = plugins.concat(args.pop())
  }

  return comanche(args, plugins)
}
