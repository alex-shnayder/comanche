const { next } = require('hooter/effects')
const { findOneByName, findByIds } = require('../../common')


module.exports = function executionPlugin(lifecycle) {
  let config

  lifecycle.hook('start', function* (_config) {
    config = yield next(_config)
    return config
  })

  lifecycle.hookBefore('execute', function* (commands) {
    if (!Array.isArray(commands) || commands.length === 0) {
      throw new Error('The first argument of execute must be an array of commands')
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
      } else if (!Array.isArray(name)) {
        throw new Error('A command name must be an array or a string')
      }

      let commandConfig = findOneByName(config.commands, 'commands', name)

      if (commandConfig.options) {
        commandConfig = Object.assign({}, commandConfig, {
          options: findByIds(config.options, commandConfig.options),
        })
      }

      let inputName = command.inputName || name[name.length - 1]
      let newCommand = Object.assign({}, command, {
        name, inputName, config: commandConfig,
      })

      if (!options) {
        return newCommand
      }

      if (!Array.isArray(options)) {
        throw new Error('Options must be an array')
      }

      options.forEach((option) => {
        if (!option || typeof option !== 'object') {
          throw new Error('An option must be an object')
        }

        if (!option.name || typeof option.name !== 'string') {
          throw new Error('An option must have a name')
        }
      })

      if (commandConfig) {
        newCommand.options = options.map((option) => {
          let optionConfig = findOneByName(commandConfig.options, option.name)
          let inputName = option.inputName || option.name
          return Object.assign({}, option, { inputName, config: optionConfig })
        })
      }

      return newCommand
    })

    return yield next(commands)
  })

  lifecycle.hookAfter('execute', function* (commands) {
    let context

    for (let i = 0; i < commands.length; i++) {
      let { name, options } = commands[i]

      if (options) {
        options = options.reduce((options, option) => {
          let { outputName, value } = option

          if (!outputName) {
            throw new Error('All options must have an output name in the end of execution')
          }

          options[outputName] = value
          return options
        }, {})
      }

      context = yield lifecycle.toot('handle', name, options || {}, context)
    }

    return context
  })
}
