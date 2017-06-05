const { next } = require('hooter/effects')
const {
  InputError, findDefaultCommand, populateCommand,
} = require('../../common')
const composeHelp = require('./help')
const parseArgs = require('./parseArgs')
const extendApi = require('./extendApi')


function print(string, level = 'log') {
  /* eslint-disable no-console */
  console[level]()
  console[level](string)
  console[level]()
}

function handleError(err, command) {
  /* eslint-disable no-console */
  // TODO: show help on error

  let text = err

  if (err instanceof InputError) {
    text = err.message

    if (command) {
      let { inputName, config } = command
      let commandName = inputName || (config && config.name)
      text += '\n\n'
      text += composeHelp(commandName, config)
    }
  }

  print(text, 'error')
}

function handleResult(result) {
  if (typeof result === 'string') {
    print(result)
  }
}


module.exports = function cliPlugin(lifecycle) {
  let config

  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hook('start', function* (_config) {
    config = yield next(_config)

    let defaultCommand = findDefaultCommand(config)

    if (defaultCommand) {
      defaultCommand = populateCommand(defaultCommand, config)
      defaultCommand = {
        inputName: defaultCommand.name,
        config: defaultCommand,
      }
    }

    Promise.resolve()
      .then(() => {
        let args = process.argv.slice(2)
        return parseArgs(args, config)
      })
      .then((commands) => {
        return lifecycle.toot('execute', commands)
      })
      .then(handleResult)
      .catch((err) => {
        lifecycle.tootWith('error', (err, event) => {
          let { type, args } = event || {}
          let command

          if (type === 'execute' || type === 'execute.batch') {
            command = args[0] && args[0][0]
          } else if (type === 'execute.one' || type === 'execute.handle') {
            command = args[0]
          } else {
            command = defaultCommand
          }

          handleError(err, command)
        }, err)
      })

    return config
  })

  lifecycle.hook('execute.batch', function* (commands) {
    // This repeats the similar block in the help plugin
    // TODO: DRY it
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
      help = (help === true) ? composeHelp(command, config) : help
      return help || `Help is unavailable for "${command.inputName}"`
    }

    return yield next(commands)
  })
}
