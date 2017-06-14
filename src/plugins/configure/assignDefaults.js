function assignItemDefaults(props, item) {
  item = Object.assign({}, item)
  props.forEach(([key, prop]) => {
    if (typeof prop.default !== 'undefined' &&
        typeof item[key] === 'undefined') {
      item[key] = prop.default
    }
  })
  return item
}

module.exports = function assignDefaults(schema, config) {
  let commandProps = Object.entries(schema.definitions.command.properties)
  let optionProps = Object.entries(schema.definitions.option.properties)
  let { commands, options } = config

  if (commands && commands.length) {
    commands = commands.map((command) => {
      return assignItemDefaults(commandProps, command)
    })
  }

  if (options && options.length) {
    options = options.map((option) => {
      return assignItemDefaults(optionProps, option)
    })
  }

  return Object.assign({}, config, { commands, options })
}
