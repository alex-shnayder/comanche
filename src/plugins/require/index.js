const { next } = require('hooter/effects')
const modifySchema = require('./modifySchema')
const handleUnknownCommand = require('./handleUnknownCommand')
const validateCommand = require('./validateCommand')


module.exports = function requirePlugin(lifecycle) {
  lifecycle.hook('schema', function* (schema) {
    schema = modifySchema(schema)
    return yield next(schema)
  })

  lifecycle.hook('process', function* (config, command) {
    if (!command.config) {
      handleUnknownCommand(config, command)
    }

    validateCommand(command)
    return yield next(config, command)
  })
}
