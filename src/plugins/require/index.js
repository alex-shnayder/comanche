const { next } = require('hooter/effects')
const extendApi = require('./extendApi')
const validateCommand = require('./validateCommand')


module.exports = function requirePlugin(lifecycle) {
  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hook('process', function* (_, command) {
    validateCommand(command)
    return yield next(_, command)
  })
}
