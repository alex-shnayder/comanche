const { assign } = require('../../common')


const OPTION_PROPERTIES = {
  coerce: {
    typeof: 'function',
  },
}


module.exports = function modifySchema(schema) {
  return assign(schema, 'definitions.option.properties', OPTION_PROPERTIES)
}
