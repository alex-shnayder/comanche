const { assignDefaults: assignItemDefaults } = require('../../common')


module.exports = function assignDefaults(schema, config) {
  let { commands, options } = config
  let hasCommands = commands && commands.length
  let hasOptions = options && options.length

  if (hasCommands) {
    let commandSchema = schema.definitions.command
    commands = commands.map((command) => {
      return assignItemDefaults(commandSchema, command)
    })
  }

  if (hasOptions) {
    let optionSchema = schema.definitions.option
    options = options.map((option) => {
      return assignItemDefaults(optionSchema, option)
    })
  }

  if (hasCommands || hasOptions) {
    return Object.assign({}, config, { commands, options })
  } else {
    return config
  }
}
