const { next } = require('hooter/effects')

module.exports = function executionPlugin(lifecycle) {
  lifecycle.hookBefore('dispatch', function* (commands) {
    if (!Array.isArray(commands) || commands.length === 0) {
      throw new Error('The first argument of dispatch must be an array of commands')
    }

    commands = commands.map((command) => {
      if (!command || typeof command !== 'object') {
        throw new Error('A command must be an object')
      }

      let { name, options } = command

      if (typeof name === 'string') {
        if (!name.length) {
          throw new Error('A command name must not be empty')
        }

        name = [name]
      }

      if (!Array.isArray(name)) {
        throw new Error('A command name must be an array or a string')
      }

      options = options || {}

      if (!options || typeof options !== 'object') {
        throw new Error('Options must be an object')
      }

      return { name, options }
    })

    return yield next(commands)
  })

  lifecycle.hookAfter('dispatch', function* (commands) {
    let context

    for (let i = 0; i < commands.length; i++) {
      let { name, options } = commands[i]
      context = yield lifecycle.toot('execute', name, options, context)
    }

    return context
  })

  lifecycle.hookAfter('execute', (...args) => {
    return lifecycle.toot('handle', ...args)
  })
}
