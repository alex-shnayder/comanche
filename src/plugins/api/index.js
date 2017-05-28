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
        'The default API plugin is overriding another plugin\'s modifications. ' +
        'Either change the order of the plugins, or disable the default one'
      )
    }

    return yield next(ExecutableCommandWithLifecycle)
  })

  // TODO: consider extracting option sharing to a separate plugin
  lifecycle.hook('execute.batch', function* (commands) {
    let providedOptionsById = {}

    commands.forEach(({ options }) => {
      if (options) {
        options.forEach((option) => {
          if (option.config) {
            providedOptionsById[option.config.id] = option
          }
        })
      }
    })

    commands = commands.map((command) => {
      if (!command.config || !command.config.options) {
        return command
      }

      command = Object.assign({}, command)
      command.config.options.forEach(({ id }) => {
        let providedOption = providedOptionsById[id]

        if (providedOption) {
          let option = command.options && command.options.find((o) => {
            return o.config && o.config.id === id
          })

          if (!option) {
            command.options.push(providedOption)
          }
        }
      })

      return command
    })

    return yield next(commands)
  })
}
