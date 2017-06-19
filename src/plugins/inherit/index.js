const { next } = require('hooter/effects')
const modifySchema = require('./modifySchema')
const shareOptionValues = require('./shareOptionValues')
const inherit = require('./inherit')


module.exports = function inheritPlugin(lifecycle) {
  let schema

  lifecycle.hook('schema', function* (_schema) {
    _schema = modifySchema(_schema)
    schema = yield next(_schema)
    return schema
  })

  lifecycle.hookStart('configure', function* (config) {
    config = inherit(schema, config)
    return yield next(config)
  })

  lifecycle.hook('execute', function* (_, commands) {
    commands = shareOptionValues(commands)
    return yield next(_, commands)
  })
}
