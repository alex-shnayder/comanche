const Hooter = require('hooter')


const EVENTS = [
  ['init', 'sync'],
  ['start', 'sync'],
  ['execute', 'async'],
  ['execute.batch', 'async'],
  ['execute.one', 'async'],
  ['execute.handle', 'async'],
  ['error', 'sync'],
]


module.exports = function comanche(args, plugins) {
  let lifecycle = new Hooter()

  if (!Array.isArray(plugins)) {
    throw new Error('Plugins must be an array of functions')
  }

  EVENTS.forEach(([event, mode]) => {
    lifecycle.register(event, mode)
  })

  plugins.forEach((plugin) => plugin(lifecycle))
  return lifecycle.tootWith('init', (Class) => new Class(...args))
}
