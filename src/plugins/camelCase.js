const camelcaseKeys = require('camelcase-keys')
const { next } = require('hooter/effects')

module.exports = function camelCasePlugin(lifecycle) {
  lifecycle.hookAfter('execute', function* (command, options, ...args) {
    options = camelcaseKeys(options)
    return yield next(command, options, ...args)
  })
}
