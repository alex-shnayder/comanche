const camelcaseKeys = require('camelcase-keys')
const { next } = require('hooter/effects')

module.exports = function runPlugin(lifecycle) {
  lifecycle.hookBefore('run', function* (commands) {
    if (!Array.isArray(commands) || commands.length === 0) {
      throw new Error('The first argument of run must be an array of commands')
    }

    return yield next(commands)
  })

  lifecycle.hookAfter('run', function* (commands) {
    yield lifecycle.toot('validate', commands)

    let context

    for (let i = 0; i < commands.length; i++) {
      let { command, options } = commands[i]
      options = camelcaseKeys(options)
      context = yield lifecycle.toot(`invoke.${command}`, options, context)
    }

    return context
  })
}
