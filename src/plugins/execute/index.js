const {
  next, resolve, suspend, getResume, tootWith, hookStart, hookEnd,
} = require('hooter/effects')
const prepareCommands = require('./prepareCommands')


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


module.exports = function* executePlugin() {
  yield hookStart('execute', function* (config, request) {
    if (!Array.isArray(request) || request.length === 0) {
      throw new Error('The first argument of "execute" must be an array of commands')
    }

    request = prepareCommands(request, config)
    return yield next(config, request)
  })

  yield hookEnd('execute', function* (_, request) {
    let resumes = []
    let context

    for (let i = 0; i < request.length; i++) {
      let result = yield tootWith('process', function* (_, command) {
        validateCommand(command)
        let resume = yield getResume()
        let result = new ProcessingResult(command, resume)
        return yield suspend(result)
      }, request[i])

      // If the result is not an instance of ProcessingResult,
      // it means that a handler has returned early effectively
      // completing the execution
      if (result instanceof ProcessingResult) {
        request[i] = result.command
        resumes[i] = result.resume
      } else {
        return result
      }
    }

    for (let i = 0; i < request.length; i++) {
      context = yield tootWith('handle', (_, __, c) => c, request[i], context)
      context = yield resolve(resumes[i](context))
    }

    return context
  })
}
