module.exports = function extendApi(BaseClass) {
  class ValidatableOption extends BaseClass.Option {
    validate(value) {
      if (typeof value !== 'function' && !(value instanceof RegExp)) {
        throw new Error('The argument of validate() must be either a function or a regular expression')
      }

      this.config.validate = value
      return this
    }
  }

  class ValidatableCommand extends BaseClass {}

  ValidatableCommand.Option = ValidatableOption
  return ValidatableCommand
}
