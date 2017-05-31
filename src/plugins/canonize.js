const { next } = require('hooter/effects')


module.exports = function canonizePlugin(lifecycle) {
  lifecycle.hookEnd('execute.batch', function* (commands) {
    commands = commands.map((command) => {
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

      return Object.assign({}, command, { outputName, options })
    })

    return yield next(commands)
  })
}
