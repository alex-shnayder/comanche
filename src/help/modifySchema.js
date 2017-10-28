const { assign, push } = require('appache/common')


const COMMAND_PROPERTIES = {
  help: {
    type: 'boolean',
    default: true,
  },
}


module.exports = function modifySchema(schema) {
  schema = push(schema, 'definitions.command.properties.inheritableSettings.default', 'help')
  return assign(schema, 'definitions.command.properties', COMMAND_PROPERTIES)
}
