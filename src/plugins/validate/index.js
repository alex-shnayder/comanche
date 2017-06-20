const { next, hook } = require('hooter/effects')
const modifySchema = require('./modifySchema')
const validateCommand = require('./validateCommand')


module.exports = function* validatePlugin() {
  yield hook('schema', function* (schema) {
    schema = modifySchema(schema)
    return yield next(schema)
  })

  yield hook('process', function* (_, command) {
    validateCommand(command)
    return yield next(_, command)
  })
}
