const { next } = require('hooter/effects')
const ExecutableCommand = require('./ExecutableCommand')

module.exports = function apiPlugin(lifecycle) {
  lifecycle.hook('init', function* (Class) {
    if (Class) {
      console.warn(
        'The default API plugin is overriding another plugin\'s modifications.' +
          'Either change the order of the plugins, or disable the default one'
      )
    }

    return yield next(ExecutableCommand.bind(null, lifecycle))
  })
}
