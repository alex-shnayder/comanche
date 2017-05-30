const { next } = require('hooter/effects')
const { InputError } = require('../../common')
const composeHelp = require('./help')
const parseArgs = require('./parseArgs')
const extendApi = require('./extendApi')


function handleError(err) {
  /* eslint-disable no-console */
  // TODO: show help on error

  if (err instanceof InputError) {
    console.error(err.message)
  } else {
    console.error(err)
  }
}

function handleResult(result) {
  /* eslint-disable no-console */

  if (typeof result === 'string') {
    console.log(result)
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

    Promise.resolve()
      .then(() => {
        let args = process.argv.slice(2)
        return parseArgs(args, config)
      })
      .then((commands) => {
        return lifecycle.toot('execute', commands, handleError)
      }, (err) => {
        return lifecycle.tootSyncWith('error', handleError, err)
      })
      .then(handleResult)

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
