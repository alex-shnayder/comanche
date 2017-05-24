const { findOneByName } = require('../../common')


function validateOption(name, value, config) {
  if (config.required && typeof value === 'undefined') {
    throw new Error(`Option "${name}" is required`)
  }
}

function validateCommand(command, commandConfig, options, optionConfigs) {
  Object.keys(options).forEach((option) => {
    let optionConfig = findOneByName(optionConfigs, option)
    let optionValue = options[option]

    if (!optionConfig && commandConfig.strict) {
      throw new Error(`Unknown option ${option}`)
    }

    validateOption(option, optionValue, optionConfig)
  })
}


module.exports = validateCommand
