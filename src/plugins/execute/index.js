const {
  next, resolve, suspend, getResume, tootWith, hookStart, hookEnd,
} = require('hooter/effects')
const preprocessRequest = require('./preprocessRequest')


function ProcessingResult(command, resume) {
  this.command = command
  this.resume = resume
}

function validateCommand(command) {
  if (!command || typeof command !== 'object') {
    throw new Error('The result of processing a command must be a command object')
  }
}


module.exports = function* executePlugin() {
  yield hookStart('execute', function* (config, request) {
    request = preprocessRequest(request, config)
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
      let event = (request[i + 1]) ? 'tap' : 'handle'
      context = yield tootWith(event, (_, __, c) => c, request[i], context)
      context = yield resolve(resumes[i](context))
    }

    return context
  })
}
