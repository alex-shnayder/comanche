const comanche = require('./comanche')
const api = require('./plugins/api')
const run = require('./plugins/run')

const DEFAULT_PLUGINS = [api, run]

module.exports = function defaultComanche(...args) {
  let plugins = DEFAULT_PLUGINS

  if (Array.isArray(args[args.length - 1])) {
    plugins = plugins.concat(args.pop())
  }

  return comanche(args, plugins)
}
