const { next } = require('hooter/effects')


let optionCounter = 0

function createOption() {
  return {
    id: `help${++optionCounter}`,
    name: 'help',
    aliases: 'h',
    description: 'Show help',
    type: 'boolean',
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
  lifecycle.hook('configure', function* (config, ...args) {
    config = injectOptions(config)
    return yield next(config, ...args)
  })

  lifecycle.hookEnd('process', function* (_, command) {
    let { inputName, options, config } = command

    let isHelpAsked = options && options.some((option) => {
      return option.config && option.config.isHelpOption
    })

    if (!isHelpAsked) {
      return yield next(_, command)
    }

    let help = config && config.help
    return (typeof help === 'string') ?
      help :
      `Help is unavailable for "${inputName}"`
  })
}
