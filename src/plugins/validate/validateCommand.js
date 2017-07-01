const { InputError } = require('../../common')


function validateOption(option) {
  let { config, value, inputName } = option

  if (config && config.validate) {
    let validate = config.validate

    if (typeof validate === 'function') {
      validate(option)
    } else if (validate instanceof RegExp) {
      if (!validate.test(value)) {
        throw new InputError(
            `Value "${value}" of option "${inputName}" ` +
            `does not match the regular expression ${validate}`
          )
      }
    } else {
      throw new Error('"validate" must be either a function or a regular expression')
    }
  }
}

function validateCommand({ options }) {
  if (options) {
    options.forEach((option) => validateOption(option))
  }
}


module.exports = validateCommand
