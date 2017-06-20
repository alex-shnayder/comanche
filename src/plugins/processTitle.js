const { next, hookStart } = require('hooter/effects')
const { findDefaultCommand } = require('../common')


module.exports = function* processTitlePlugin() {
  yield hookStart('configure', function* (_, config) {
    let command = findDefaultCommand(config)

    if (command) {
      process.title = command.name
    }

    return yield next(_, config)
  })
}
