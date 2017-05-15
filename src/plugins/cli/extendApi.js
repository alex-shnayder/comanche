module.exports = function extendApi(BaseClass) {
  class CliOption extends BaseClass.Option {
    long(value = true) {
      if (typeof value !== 'boolean') {
        throw new Error('The argument of long() must be boolean')
      }

      this.config.long = value
      return this
    }

    short(value = true) {
      if (typeof value !== 'boolean') {
        throw new Error('The argument of short() must be boolean')
      }

      this.config.short = value
      return this
    }

    positional(value = true) {
      if (typeof value !== 'boolean') {
        throw new Error('The argument of positional() must be boolean')
      }

      this.config.positional = value
      return this
    }
  }

  class CliCommand extends BaseClass {}
  CliCommand.Option = CliOption

  return CliCommand
}
