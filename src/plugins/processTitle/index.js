const { next, hookStart, call } = require('hooter/effects')
const { findDefaultCommand } = require('../../common')


function setProcessTitle(config) {
  let command = findDefaultCommand(config)

  if (command) {
    process.title = command.name
  }
}

function* configureHandler(schema, config) {
  yield call(setProcessTitle, config)
  return yield next(schema, config)
}

module.exports = function* processTitlePlugin() {
  yield hookStart('configure', configureHandler)
}
