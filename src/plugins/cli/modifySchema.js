const { assign } = require('../../common')


const OPTION_PROPERTIES = {
  positional: {
    type: 'boolean',
    default: false,
  },
}


module.exports = function modifySchema(schema) {
  return assign(schema, 'definitions.option.properties', OPTION_PROPERTIES)
}
