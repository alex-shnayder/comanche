const { assign } = require('../../common')


const OPTION_PROPERTIES = {
  positional: {
    type: 'boolean',
    default: false,
  },
  consume: {
    type: 'boolean',
    default: true,
  },
}


module.exports = function modifySchema(schema) {
  return assign(schema, 'definitions.option.properties', OPTION_PROPERTIES)
}
