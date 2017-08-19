const {
  next, suspend, getResume, toot, hookStart, hookEnd,
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

function* processCb(_, command) {
  validateCommand(command)
  let resume = yield getResume()
  let result = new ProcessingResult(command, resume)
  return yield suspend(result)
}

function handleCb(config, command, context) {
  return context
}


module.exports = function* executePlugin() {
  yield hookStart('execute', function* (config, request) {
    this.source = this.tooter
    request = preprocessRequest(request, config)
    return yield next(config, request)
  })

  yield hookEnd('execute', function* (_, request) {
    let processEvent = {
      name: 'process',
      cb: processCb,
      source: this.source,
    }
    let resumes = []
    let context

    for (let i = 0; i < request.length; i++) {
      let result = yield yield toot(processEvent, request[i])

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
      let event = {
        name: (request[i + 1]) ? 'tap' : 'handle',
        cb: handleCb,
        source: this.source,
      }
      context = yield yield toot(event, request[i], context)
      context = yield resumes[i](context)
    }

    return context
  })
}
