const { next } = require('hooter/effects')
const ExecutableCommand = require('./ExecutableCommand')

module.exports = function apiPlugin(lifecycle) {
  class ExecutableCommandWithLifecycle extends ExecutableCommand {
    constructor(...args) {
      super(...args)
      this.lifecycle = lifecycle
    }
  }

  lifecycle.hook('init', function* (Class) {
    if (Class) {
      // eslint-disable-next-line
      console.warn(
        'The default API plugin is overriding another plugin\'s modifications.' +
        'Either change the order of the plugins, or disable the default one'
      )
    }

    return yield next(ExecutableCommandWithLifecycle)
  })
}
