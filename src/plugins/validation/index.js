const { next } = require('hooter/effects')
const { findOneByName, findByIds } = require('../../common')
const extendApi = require('./extendApi')
const validateCommand = require('./validateCommand')


module.exports = function validationPlugin(lifecycle) {
  let config

  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hook('start', function* (_config) {
    config = yield next(_config)
    return config
  })

  lifecycle.hook('dispatch', function* (commands) {
    commands.forEach(({ name: command, options }) => {
      let commandConfig = findOneByName(config.commands, 'commands', command)

      if (!commandConfig) {
        throw new Error(`Unknown command "${command.join(' ')}"`)
      }

      let optionConfigs = findByIds(config.options, commandConfig.options)
      validateCommand(command, commandConfig, options, optionConfigs)
    })

    return yield next(commands)
  })
}
