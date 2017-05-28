const { next } = require('hooter/effects')
const extendApi = require('./extendApi')


module.exports = function versionPlugin(lifecycle) {
  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hookAfter('execute.batch', function* (commands) {
    for (let i = 0; i < commands.length; i++) {
      let options = commands[i].options

      if (!options) {
        continue
      }

      for (let j = 0; j < options.length; j++) {
        let config = options[j].config

        if (config && config._isVersion) {
          let version = config._version

          if (version) {
            return (version.charAt(0) === 'v') ? version : `v${version}`
          } else {
            return 'Unable to determine the current version'
          }
        }
      }
    }

    return yield next(commands)
  })
}
