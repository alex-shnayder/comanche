const { next } = require('hooter/effects')
const {
  InputError, findDefaultCommand, findCommandByFullName, getCommandFromEvent,
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
  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hook('start', function* (config, ...args) {
    let defaultCommand = findDefaultCommand(config, true)

    if (defaultCommand) {
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
        lifecycle.tootWith('error', (_, err, event) => {
          let command

          if (err.command) {
            command = Object.assign({}, err.command)
            command.config = findCommandByFullName(config, command.name)
          } else if (event) {
            command = getCommandFromEvent(event)
          }

          handleError(err, command || defaultCommand)
        }, err)
      })

    return yield next(config, ...args)
  })

  lifecycle.hook('process', function* (_, command) {
    // This repeats the similar block in the help plugin
    // TODO: DRY it

    let { inputName, options, config } = command

    let isHelpAsked = options && options.some((option) => {
      return option.config && option.config.isHelpOption
    })

    if (!isHelpAsked) {
      return yield next(_, command)
    }

    if (config) {
      return composeHelp(inputName, config)
    }

    return `Help is unavailable for "${inputName}"`
  })
}
