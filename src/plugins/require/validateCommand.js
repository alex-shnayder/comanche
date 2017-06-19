const { InputError } = require('../../common')


function validateCommand({ options, config }) {
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

  if (config.strict && options) {
    let option = options.find((option) => !option.config)

    if (option) {
      throw new InputError(`Unknown option "${option.inputName}"`)
    }
  }
}


module.exports = validateCommand
