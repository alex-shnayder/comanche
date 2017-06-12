const { assign } = require('../../common')


const OPTION_PROPERTIES = {
  validate: {
    anyOf: [{
      typeof: 'function',
    }, {
      instanceof: 'RegExp',
    }],
  },
}


module.exports = function modifySchema(schema) {
  return assign(schema, 'definitions.option.properties', OPTION_PROPERTIES)
}
