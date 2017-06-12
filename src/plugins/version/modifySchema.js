// TODO:
// if (this.config.default) {
//   this.config.version = true
//   this.sharedSettings.push('version')
// }

const { assign } = require('../../common')


const COMMAND_PROPERTIES = {
  version: {
    type: ['boolean', 'string'],
  },
}


module.exports = function modifySchema(schema) {
  return assign(schema, 'definitions.command.properties', COMMAND_PROPERTIES)
}
