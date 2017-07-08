/* eslint-disable global-require */

const corePlugins = {
  configure: require('./plugins/configure'),
  inherit: require('./plugins/inherit'),
  error: require('./plugins/error'),
  execute: require('./plugins/execute'),
}
const defaultPlugins = {
  api: require('./plugins/api'),
  cli: require('./plugins/cli'),
  version: require('./plugins/version'),
  help: require('./plugins/help'),
  require: require('./plugins/require'),
  validate: require('./plugins/validate'),
  coerce: require('./plugins/coerce'),
  types: require('./plugins/types'),
  canonize: require('./plugins/canonize'),
  camelize: require('./plugins/camelize'),
  defaultValues: require('./plugins/defaultValues'),
  processTitle: require('./plugins/processTitle'),
}


const CORE_PLUGINS = Object.values(corePlugins)
const DEFAULT_PLUGINS = Object.values(defaultPlugins)
const CORE_AND_DEFAULT_PLUGINS = CORE_PLUGINS.concat(DEFAULT_PLUGINS)


/*
  The core plugins are always included.
  An item in the array can be:
  - A function (a plugin itself)
  - `false` to exclude the default plugins
  - `true` to include the default plugins
  - A string with the name of a default plugin to include
  - A string prefixed with '-' with the name of a default plugin to exclude
*/

module.exports = function pluginize(plugins) {
  let result = CORE_AND_DEFAULT_PLUGINS.slice()

  plugins && plugins.forEach((item) => {
    let remove = false
    let plugin = item

    if (item === false) {
      result = result.filter((plugin) => {
        return !DEFAULT_PLUGINS.includes(plugin)
      })
      return
    } else if (item === true) {
      result = result.concat(
        DEFAULT_PLUGINS.filter((plugin) => {
          return !result.includes(plugin)
        })
      )
      return
    }

    if (typeof item === 'string') {
      remove = false

      if (item[0] === '-') {
        remove = true
        item = item.substr(1)
      }

      plugin = defaultPlugins[item]

      if (!plugin) {
        throw new Error(`Plugin "${item}" is unknown`)
      }
    }

    if (typeof plugin !== 'function') {
      throw new Error('A plugin must be a function')
    }

    if (remove) {
      result = result.filter((p) => p !== plugin)
    } else {
      result.push(plugin)
    }
  })

  return result
}
