const { InputError } = require('../../common')


const BASIC_TYPES = ['string', 'boolean', 'number', 'function']

function validateOption({ inputName, value, config }) {
  let { type } = config
  let isTypeCorrect = (!BASIC_TYPES.includes(type) || typeof value === type)

  if (!isTypeCorrect || Number.isNaN(value)) {
    throw new InputError(`Option "${inputName}" must be a ${type}`)
  }
}

function validateCommand({ inputName, options, config }) {
  if (!config) {
    throw new InputError(`Unknown command "${inputName}"`)
  }

  if (config.options && config.options.length) {
    config.options.forEach((optionConfig) => {
      if (optionConfig.required) {
        let option = options.find((option) => {
          return option.config && option.config.id === optionConfig.id
        })

        if (!option || option.value === null) {
          throw new InputError(`Option "${optionConfig.name}" is required`)
        }
      }
    })
  }

  if (!options) {
    return
  }

  options.forEach((option) => {
    if (!option.config) {
      if (config.strict) {
        throw new InputError(`Unknown option "${option.inputName}"`)
      }

      return
    }

    validateOption(option)
  })
}


module.exports = validateCommand
