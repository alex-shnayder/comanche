function validateName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('A command name or alias must be a non-empty string')
  }

  if (name.charAt(0) === '-') {
    throw new Error(
      'A hyphen is not allowed as the first character of a command name or alias'
    )
  }

  if (!/[a-z0-9_-]/.test(name)) {
    throw new Error(
      'A command name or alias may only contain lowercase letters, numbers, underscores and hyphens'
    )
  }
}

class Command {
  constructor(name, parent) {
    if (!name) {
      throw new Error('Either a name or config is required to define a command')
    }

    let config = typeof name === 'string' ? { name } : name

    if (!config.name) {
      throw new Error('A name is required to define a command')
    }

    if (parent) {
      this.parent = parent
    }

    this.config = {
      alias: [],
    }
    this.commands = []
    this.options = []
    this.sharedSettings = []
    this.set(config)
  }

  set(config) {
    let { name, alias, description, share, commands, options } = config

    if (name) {
      this.name(name)
    }

    if (alias) {
      this.alias(alias)
    }

    if (description) {
      this.description(description)
    }

    if (share) {
      this.share(share)
    }

    if (commands) {
      if (!Array.isArray(commands)) {
        throw new TypeError(
          'The value of the "commands" property must be an array'
        )
      }

      commands.forEach((command) => this.command(command))
    }

    if (options) {
      if (!Array.isArray(options)) {
        throw new TypeError(
          'The value of the "options" property must be an array'
        )
      }

      options.forEach((option) => this.option(option))
    }

    return this
  }

  name(name) {
    validateName(name)
    this.config.name = name
    return this
  }

  alias(alias) {
    let isArray = Array.isArray(alias)

    if (typeof alias !== 'string' && !isArray) {
      throw new TypeError(
        'The argument of alias() must be either a string or an array'
      )
    }

    if (isArray) {
      alias.forEach((a) => validateName(a))
    } else {
      validateName(alias)
      alias = [alias]
    }

    this.config.alias = alias
    return this
  }

  description(description) {
    if (typeof description !== 'string' || description.length === 0) {
      throw new TypeError('A description must be a non-empty string')
    }

    this.config.description = description
    return this
  }

  command(config) {
    let command = new this.constructor(config, this)
    this.commands.push(command)
    return command
  }

  option(config) {
    let option = new this.constructor.Option(config, this)
    this.options.push(option)
    return option
  }

  share(...settings) {
    settings.forEach((setting) => {
      if (typeof setting !== 'string') {
        throw new Error('A setting to share must be a string')
      }
    })

    this.sharedSettings = this.sharedSettings.concat(settings)
    return this
  }

  end() {
    return this.parent
  }

  getSharedOptions() {
    let parentOptions = this.parent ? this.parent.getSharedOptions() : []
    let ownOptions

    if (this.sharedSettings.includes('options')) {
      ownOptions = this.options
    } else {
      ownOptions = this.options.filter((option) => option.config.shared)
    }

    return parentOptions.concat(ownOptions)
  }

  getSharedConfig() {
    let parentConfig = this.parent ? this.parent.getSharedConfig() : {}
    let ownConfig = this.sharedSettings.reduce((config, setting) => {
      if (setting !== 'options') {
        config[setting] = this.config[setting]
      }
      return config
    }, {})
    return Object.assign(parentConfig, ownConfig)
  }

  getConfig() {
    let config = this.config
    let sharedConfig = this.parent ? this.parent.getSharedConfig() : {}

    let commands = this.commands.map((command) => {
      return Object.assign(sharedConfig, command.getConfig())
    })
    let options = this.parent ? this.parent.getSharedOptions() : []
    options = options.concat(this.options).map((option) => option.getConfig())

    return Object.assign({ commands, options }, config)
  }
}

module.exports = Command
