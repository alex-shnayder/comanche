const { assign } = require('../../common')


const OPTION_PROPERTIES = {
  long: {
    type: 'boolean',
    default: true,
  },
  short: {
    type: 'boolean',
    default: true,
  },
  positional: {
    type: 'boolean',
    default: false,
  },
}


module.exports = function modifySchema(schema) {
  return assign(schema, 'definitions.option.properties', OPTION_PROPERTIES)
}
