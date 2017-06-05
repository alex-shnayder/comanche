module.exports = function extendApi(BaseClass) {
  class OptionWithDefaultValue extends BaseClass.Option {
    default(value) {
      if (typeof value === 'undefined') {
        throw new Error('The default value of an option must not be undefined')
      }

      this.config.default = value
      return this
    }
  }

  class CommandWithDefaultValues extends BaseClass {}
  CommandWithDefaultValues.Option = OptionWithDefaultValue

  return CommandWithDefaultValues
}
