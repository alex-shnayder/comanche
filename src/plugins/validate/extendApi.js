module.exports = function extendApi(BaseClass) {
  class StrictCommand extends BaseClass {
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

  return StrictCommand
}
