const readPkgUp = require('read-pkg-up')


module.exports = function extendApi(BaseClass) {
  class CommandWithVersion extends BaseClass {
    constructor(...args) {
      super(...args)

      if (this.config.default) {
        this.config.version = true
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

    getConfig() {
      if (!this.config.version) {
        return super.getConfig()
      }

      let option = this
        .option('version')
        .alias('v')
        .description('Show the current version')
        .shared()
      option.config._isVersion = true

      let config = super.getConfig()

      if (config.version === true) {
        let { pkg } = readPkgUp.sync({
          cwd: process.argv[1],
        })

        option.config._version = pkg.version
      } else {
        option.config._version = config.version
      }

      return config
    }
  }

  return CommandWithVersion
}
