const { next } = require('hooter/effects')

module.exports = function runPlugin(lifecycle) {
  lifecycle.hookBefore('run', function* (command, options) {
    // Make sure options are always an object

    if (typeof command !== 'string' || !command) {
      throw new TypeError('A command must be a string')
    }

    if (/[\s*]/.test(command)) {
      throw new Error('A command must not contain spaces or asterisks')
    }

    if (options && typeof options !== 'object') {
      throw new TypeError('Options must be an object')
    }

    return yield next(command, options || {})
  })

  lifecycle.hookAfter('run', function* (command, options) {
    yield lifecycle.toot('validate', command, options)
    yield lifecycle.toot(`invoke.${command}`, options)
  })
}
