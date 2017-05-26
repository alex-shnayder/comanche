const { next } = require('hooter/effects')
const extendApi = require('./extendApi')


function output(version) {
  if (version) {
    version = (version.charAt(0) === 'v') ? version : `v${version}`
    // eslint-disable-next-line
    console.log(version)
  } else {
    // eslint-disable-next-line
    console.log('Unable to determine the current version')
  }
}

module.exports = function versionPlugin(lifecycle) {
  lifecycle.hook('init', function* (BaseClass) {
    let NewClass = extendApi(BaseClass)
    return yield next(NewClass)
  })

  lifecycle.hookAfter('execute', function* (commands) {
    for (let i = 0; i < commands.length; i++) {
      let options = commands[i].options

      if (options) {
        for (let j = 0; j < options.length; j++) {
          let config = options[j].config

          if (config && config._isVersion) {
            output(config._version)
            return
          }
        }
      }
    }

    return yield next(commands)
  })
}
