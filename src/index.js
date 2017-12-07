/* eslint-disable global-require */

const appache = require('appache')
const defaultPlugins = [
  require('appache-api-fluent'),
  require('appache-cli'),
  require('appache-pretty-errors'),
  require('appache-type-paths'),
  require('./help'),
  require('./version'),
]


module.exports = function comanche(...args) {
  let plugins = (Array.isArray(args[args.length - 1])) ? args.pop() : null
  plugins = plugins ? defaultPlugins.concat(plugins) : defaultPlugins
  return appache(plugins)(...args)
}
