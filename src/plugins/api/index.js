const { next } = require('hooter/effects')
const ExecutableCommand = require('./ExecutableCommand')


module.exports = function apiPlugin(lifecycle) {
  function createCommand(...args) {
    let command = new ExecutableCommand(...args)
    command.lifecycle = lifecycle
    return command
  }

  lifecycle.hook('init', function* (api) {
    if (api) {
      // eslint-disable-next-line
      console.warn(
        'The default API plugin is overriding another plugin\'s modifications. ' +
        'Either change the order of the plugins, or disable the default one'
      )
    }

    return yield next(createCommand)
  })
}
