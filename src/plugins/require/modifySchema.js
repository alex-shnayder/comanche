const { assign, push } = require('../../common')


const COMMAND_PROPERTIES = {
  strict: {
    type: 'boolean',
    default: false,
  },
}

const OPTION_PROPERTIES = {
  required: {
    type: 'boolean',
    default: false,
  },
}


module.exports = function modifySchema(schema) {
  schema = assign(schema, 'definitions.command.properties', COMMAND_PROPERTIES)
  schema = push(schema, 'definitions.command.properties.inheritableSettings.default', 'strict')
  schema = assign(schema, 'definitions.option.properties', OPTION_PROPERTIES)
  return schema
}
