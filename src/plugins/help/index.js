const { next } = require('hooter/effects')


let optionCounter = 0

function createOption() {
  return {
    id: `help${++optionCounter}`,
    name: 'help',
    aliases: 'h',
    description: 'Show help',
    isHelpOption: true, // Probably not the best way to identify the options
  }
}

function injectOptions(config) {
  let helpOptions = []
  let commands = config.commands.map((command) => {
    let { help, options } = command

    if (!help) {
      return command
    }

    let option = createOption()
    helpOptions.push(option)
    options = options ? options.concat(option.id) : [option.id]
    return Object.assign({}, command, { options })
  })

  if (!helpOptions.length) {
    return config
  }

  let options = config.options ?
    config.options.concat(helpOptions) :
    helpOptions
  return Object.assign({}, config, { commands, options })
}

module.exports = function helpPlugin(lifecycle) {
  lifecycle.hook('start', function* (config, ...args) {
    config = injectOptions(config)
    return yield next(config, ...args)
  })

  lifecycle.hook('execute.batch', function* (commands) {
    for (let i = 0; i < commands.length; i++) {
      let command = commands[i]
      let options = command.options

      if (!options) {
        continue
      }

      let isHelpAsked = options.some((option) => {
        return option.config && option.config.isHelpOption
      })

      if (!isHelpAsked) {
        continue
      }

      let help = command.config && command.config.help
      return (typeof help === 'string') ?
        help :
        `Help is unavailable for "${command.inputName}"`
    }

    return yield next(commands)
  })
}
