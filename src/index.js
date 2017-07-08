const comanche = require('./comanche')
const pluginize = require('./pluginize')


module.exports = function defaultComanche(...args) {
  if (Array.isArray(args[args.length - 1])) {
    let plugins = pluginize(args.pop())
    return comanche(args, plugins)
  }

  return comanche(args, pluginize())
}
