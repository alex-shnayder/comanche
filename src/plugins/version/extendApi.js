module.exports = function extendApi(BaseClass) {
  class CommandWithVersion extends BaseClass {
    constructor(...args) {
      super(...args)

      if (this.config.default) {
        this.config.version = true
        this.sharedSettings.push('version')
      }
    }

    version(value = true) {
      let valueType = typeof value

      if (valueType !== 'boolean' && valueType !== 'string') {
        throw new Error('The argument of version() must be either boolean or a string')
      }

      this.config.value = value
      return this
    }
  }

  return CommandWithVersion
}
