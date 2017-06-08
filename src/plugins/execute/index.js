const { next, suspend, getResume, tootWith } = require('hooter/effects')
const normalizeCommands = require('./normalizeCommands')


function ProcessingResult(command, resume) {
  this.command = command
  this.resume = resume
}

function validateCommand(command) {
  if (!command || typeof command !== 'object') {
    throw new Error('The result of processing a command must be a command object')
  }

  if (!command.outputName) {
    throw new Error('Commands must have an output name in the end of "process"')
  }

  if (command.options) {
    command.options.forEach((option) => {
      if (!option.outputName) {
        throw new Error('All options must have an output name in the end of "process"')
      }
    })
  }
}


module.exports = function executePlugin(lifecycle) {
  lifecycle.hookStart('execute', function* (config, commands) {
    if (!Array.isArray(commands) || commands.length === 0) {
      throw new Error('The first argument of execute must be an array of commands')
    }

    commands = normalizeCommands(commands, config)
    return yield next(config, commands)
  })

  lifecycle.hookEnd('execute', function* (_, commands) {
    let resumes = []
    let context

    for (let i = 0; i < commands.length; i++) {
      let result = yield tootWith('process', function* (_, command) {
        validateCommand(command)
        let resume = yield getResume()
        let result = new ProcessingResult(command, resume)
        return yield suspend(result)
      }, commands[i])

      // If the result is not an instance of ProcessingResult,
      // it means that a handler has returned early effectively
      // completing the execution

      if (result instanceof ProcessingResult) {
        commands[i] = result.command
        resumes[i] = result.resume
      } else {
        return result
      }
    }

    for (let i = 0; i < commands.length; i++) {
      context = yield tootWith('handle', (_, __, c) => c, commands[i], context)
      context = resumes[i](context)
    }

    return context
  })
}
