const { next, hook } = require('hooter/effects')
const modifySchema = require('./modifySchema')
const handleUnknownCommand = require('./handleUnknownCommand')
const validateCommand = require('./validateCommand')


module.exports = function* requirePlugin() {
  yield hook('schema', function* (schema) {
    schema = modifySchema(schema)
    return yield next(schema)
  })

  yield hook('process', function* (config, command) {
    if (!command.config) {
      handleUnknownCommand(config, command)
    }

    validateCommand(command)
    return yield next(config, command)
  })
}
