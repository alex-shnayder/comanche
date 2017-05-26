const { findOneByAliases } = require('../../common')


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

function mergeConfigs(base, source) {
  let config = Object.assign({}, base, source)

  if (base.options && source.options) {
    config.options = base.options.concat(source.options)
  }

  return config
}

class Command {
  constructor(config, parent) {
    let name

    if (config && typeof config === 'string') {
      name = config
      config = null
    } else if (config && typeof config === 'object') {
      name = config.name
    } else {
      throw new Error('The first argument of Command must be either a non-empty string or an object')
    }

    validateName(name)

    this.config = {
      name,
      id: parent ? `${parent.config.id}.${name}` : name,
      default: !parent,
      commands: [],
      options: [],
    }

    this.parent = parent
    this.commands = []
    this.options = []
    this.sharedSettings = []
    this.sharedOptions = []

    if (config) {
      this.set(config)
    }
  }

  set(config) {
    let { alias, description, share, commands, options } = config

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

    this.config.aliases = alias
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
    let existingCommands = this.commands.map((c) => c.config)
    let { name, aliases } = command.config
    let names = aliases ? aliases.concat(name) : [name]
    let matchingCommand = findOneByAliases(existingCommands, names)

    if (matchingCommand) {
      throw new Error(
        `The command "${name}" has a name or alias ` +
        `that is already taken by "${matchingCommand.name}"`
      )
    }

    this.commands.push(command)
    this.config.commands.push(command.config.id)
    return command
  }

  option(config) {
    let option = new this.constructor.Option(config, this)
    let existingOptions = this.options.map((o) => o.config)
    let { name, aliases } = option.config
    let names = aliases ? aliases.concat(name) : [name]
    let matchingOption = findOneByAliases(existingOptions, names)

    if (matchingOption) {
      throw new Error(
        `The option "${name}" has a name or alias ` +
        `that is already taken by "${matchingOption.name}"`
      )
    }

    this.options.push(option)
    this.config.options.push(option.config.id)
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

  shareOption(id) {
    if (typeof id !== 'string' && id.length !== 0) {
      throw new Error('An option id must be a non-empty string')
    }

    this.sharedOptions.push(id)
    return this
  }

  end() {
    return this.parent
  }

  getFullName() {
    let parentName = this.parent ? this.parent.getFullName() : []
    return parentName.concat(this.config.name)
  }

  getSharedConfig() {
    let inheritedConfig = this.parent ? this.parent.getSharedConfig() : {}
    let ownConfig = this.sharedSettings.reduce((ownConfig, setting) => {
      ownConfig[setting] = this.config[setting]
      return ownConfig
    }, {})
    ownConfig.options = ownConfig.options || this.sharedOptions

    return mergeConfigs(inheritedConfig, ownConfig)
  }

  getConfig() {
    let inheritedConfig = this.parent ? this.parent.getSharedConfig() : {}
    return mergeConfigs(inheritedConfig, this.config)
  }
}

module.exports = Command
