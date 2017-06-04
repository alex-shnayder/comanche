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
  plugins.forEach((plugin) => {
    plugin(lifecycle.bind(plugin))
  })

  return lifecycle.tootWith('init', (Class) => {
    if (!Class) {
      throw new Error(
        'No interface has been defined. At least one plugin must define ' +
        'an interface during the "init" event'
      )
    }

    return new Class(...args)
  })
}
