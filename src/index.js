const comanche = require('./comanche')
const api = require('./plugins/api')
const cli = require('./plugins/cli')
const execution = require('./plugins/execution')
const version = require('./plugins/version')
const validation = require('./plugins/validation')
const canonize = require('./plugins/canonize')
const camelCase = require('./plugins/camelCase')

const DEFAULT_PLUGINS = [
  execution, api, cli, version, validation, camelCase, canonize,
]

module.exports = function defaultComanche(...args) {
  let plugins = DEFAULT_PLUGINS

  if (Array.isArray(args[args.length - 1])) {
    plugins = plugins.concat(args.pop())
  }

  return comanche(args, plugins)
}
