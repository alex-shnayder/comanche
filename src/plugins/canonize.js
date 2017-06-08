const { next } = require('hooter/effects')


module.exports = function canonizePlugin(lifecycle) {
  lifecycle.hookEnd('process', function* (_, command, ...args) {
    let { name, config } = command
    let ownName = config ? config.name : name[name.length - 1]
    let outputName = name.slice(0, -1).concat(ownName)
    let options = command.options

    if (options && options.length) {
      options = options.map((option) => {
        let outputName = option.config ? option.config.name : option.name
        return Object.assign({}, option, { outputName })
      })
    }

    command = Object.assign({}, command, { outputName, options })
    return yield next(_, command, ...args)
  })
}
