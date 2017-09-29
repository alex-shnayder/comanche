/* eslint-disable global-require */

const appache = require('appache')
const pluginize = require('appache/pluginize')


const defaultPlugins = {
  api: require('appache-api-fluent'),
  cli: require('appache-cli'),
  prettyErrors: require('appache-pretty-errors'),
}


module.exports = function comanche(...args) {
  let userPlugins = (Array.isArray(args[args.length - 1])) ? args.pop() : null
  let plugins = pluginize(null, defaultPlugins, userPlugins)
  let app = appache(plugins)
  return app.apply(null, args)
}
