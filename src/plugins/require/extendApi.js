module.exports = function extendApi(BaseClass) {
  class OptionWithRequired extends BaseClass.Option {
    required(value = true) {
      if (typeof value !== 'boolean') {
        throw new Error('The argument of required() must be boolean')
      }

      this.config.required = value
      return this
    }
  }

  class CommandWithStrict extends BaseClass {
    constructor(...args) {
      super(...args)
      this.sharedSettings.push('strict')
    }

    strict(value = true) {
      if (typeof value !== 'boolean') {
        throw new Error('The argument of strict() must be boolean')
      }

      this.config.strict = value
      return this
    }
  }

  CommandWithStrict.Option = OptionWithRequired
  return CommandWithStrict
}
