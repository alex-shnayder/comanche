const comanche = require('./comanche')
const api = require('./plugins/api')
const cli = require('./plugins/cli')
const execute = require('./plugins/execute')
const version = require('./plugins/version')
const help = require('./plugins/help')
const _require = require('./plugins/require')
const validate = require('./plugins/validate')
const coerce = require('./plugins/coerce')
const types = require('./plugins/types')
const canonize = require('./plugins/canonize')
const camelCase = require('./plugins/camelCase')
const error = require('./plugins/error')
const inherit = require('./plugins/inherit')
const defaultValues = require('./plugins/defaultValues')
const configure = require('./plugins/configure')
const processTitle = require('./plugins/processTitle')


const DEFAULT_PLUGINS = [
  configure, inherit, error, execute, api, cli, defaultValues, version, help,
  coerce, _require, validate, camelCase, canonize, types, processTitle,
]


module.exports = function defaultComanche(...args) {
  let plugins = DEFAULT_PLUGINS

  if (Array.isArray(args[args.length - 1])) {
    plugins = plugins.concat(args.pop())
  }

  return comanche(args, plugins)
}
