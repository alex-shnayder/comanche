const { next } = require('hooter/effects')
const {
  InputError, findDefaultCommand, findOneByName, populateCommand,
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

          if (err.command) {
            let commands = config.commands
            command = Object.assign({}, err.command)
            command.config = findOneByName(commands, 'commands', command.name)

            if (command.config) {
              command.config = populateCommand(command.config, config)
            }
          } else if (type === 'execute') {
            command = args[0] && args[0][0]
          } else if (type === 'process' || type === 'handle') {
            command = args[0]
          }

          handleError(err, command || defaultCommand)
        }, err)
      })

    return config
  })

  lifecycle.hook('process', function* (command) {
    // This repeats the similar block in the help plugin
    // TODO: DRY it

    let { inputName, options, config } = command

    let isHelpAsked = options && options.some((option) => {
      return option.config && option.config.isHelpOption
    })

    if (!isHelpAsked) {
      return yield next(command)
    }

    if (config) {
      return composeHelp(inputName, config)
    }

    return `Help is unavailable for "${inputName}"`
  })
}
