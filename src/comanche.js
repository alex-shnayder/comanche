const Hooter = require('hooter')

module.exports = function comanche(args, plugins) {
  let lifecycle = new Hooter()

  if (!Array.isArray(plugins)) {
    throw new TypeError('Plugins must be an array of functions')
  }

  plugins.forEach((plugin) => plugin(lifecycle))
  return lifecycle.tootSyncWith('init', (Class) => new Class(...args))
}
