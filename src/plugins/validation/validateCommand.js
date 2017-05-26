function validateOption() {
}

function validateCommand({ inputName, options, config }) {
  if (!config) {
    throw new Error(`Unknown command "${inputName}"`)
  }

  if (config.options && config.options.length) {
    config.options.forEach((optionConfig) => {
      if (optionConfig.required) {
        let option = options.find((option) => {
          return option.config && option.config.id === optionConfig.id
        })

        if (!option) {
          throw new Error(`Option "${optionConfig.name}" is required`)
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
        throw new Error(`Unknown option "${option.inputName}"`)
      }

      return
    }

    validateOption(option)
  })
}

module.exports = validateCommand
