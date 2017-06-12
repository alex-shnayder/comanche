const { next } = require('hooter/effects')
const modifySchema = require('./modifySchema')
const validateCommand = require('./validateCommand')


module.exports = function validatePlugin(lifecycle) {
  lifecycle.hook('schema', function* (schema) {
    schema = modifySchema(schema)
    return yield next(schema)
  })

  lifecycle.hook('process', function* (_, command) {
    validateCommand(command)
    return yield next(_, command)
  })
}
