const { next } = require('hooter/effects')
const modifySchema = require('./modifySchema')
const shareOptionValues = require('./shareOptionValues')
const inherit = require('./inherit')


module.exports = function inheritPlugin(lifecycle) {
  lifecycle.hook('schema', function* (schema) {
    schema = modifySchema(schema)
    return yield next(schema)
  })

  lifecycle.hookStart('configure', function* (schema, config) {
    config = inherit(schema, config)
    return yield next(schema, config)
  })

  lifecycle.hook('execute', function* (_, request) {
    request = shareOptionValues(request)
    return yield next(_, request)
  })
}
