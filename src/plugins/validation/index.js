const { next } = require('hooter/effects')
const extendApi = require('./extendApi')
const validateCommand = require('./validateCommand')


module.exports = function validationPlugin(lifecycle) {
  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hook('execute', function* (commands) {
    commands.forEach((command) => validateCommand(command))
    return yield next(commands)
  })
}
