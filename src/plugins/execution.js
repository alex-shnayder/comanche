const camelcaseKeys = require('camelcase-keys')
const { next } = require('hooter/effects')

module.exports = function executionPlugin(lifecycle) {
  lifecycle.hookBefore('dispatch', function* (commands) {
    if (!Array.isArray(commands) || commands.length === 0) {
      throw new Error('The first argument of dispatch must be an array of commands')
    }

    return yield next(commands)
  })

  lifecycle.hookAfter('dispatch', function* (commands) {
    let context

    for (let i = 0; i < commands.length; i++) {
      let { name, options } = commands[i]
      options = camelcaseKeys(options)
      context = yield lifecycle.toot('execute', name, options, context)
    }

    return context
  })

  lifecycle.hookAfter('execute', (...args) => {
    return lifecycle.toot('handle', ...args)
  })
}
