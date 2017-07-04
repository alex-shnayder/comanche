module.exports = function shareOptionValues(commands) {
  let providedOptionsById = {}

  commands.forEach(({ options }) => {
    if (options && options.length) {
      options.forEach((option) => {
        if (option.config) {
          providedOptionsById[option.config.id] = option
        }
      })
    }
  })

  return commands.map((command) => {
    let { config, options } = command

    if (!config || !config.options || !config.options.length) {
      return command
    }

    let providedCommandOptions = config.options
      .filter(({ id }) => providedOptionsById[id])
      .map(({ id }) => providedOptionsById[id])

    command = Object.assign({}, command)
    command.options = (options || [])
      .filter(({ id }) => !providedOptionsById[id])
      .concat(providedCommandOptions)

    return command
  })
}
