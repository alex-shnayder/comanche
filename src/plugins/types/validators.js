const { InputError } = require('../../common')


const BASIC_TYPES = ['string', 'boolean', 'number', 'function']


BASIC_TYPES.forEach((type) => {
  module.exports[type] = function validateBasicType({ inputName, value }) {
    if (typeof value !== type || Number.isNaN(value)) {
      throw new InputError(
        `The value of option "${inputName}" must be a ${type}`
      )
    }
  }
})

module.exports.path = module.exports.string
