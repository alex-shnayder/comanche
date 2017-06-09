module.exports = function extendApi(BaseClass) {
  class CoercibleOption extends BaseClass.Option {
    coerce(fn) {
      if (typeof fn !== 'function') {
        throw new Error('The argument of coerce() must be a function')
      }

      this.config.coerce = fn
      return this
    }
  }

  class CommandWithCoercibleOption extends BaseClass {}
  CommandWithCoercibleOption.Option = CoercibleOption

  return CommandWithCoercibleOption
}
