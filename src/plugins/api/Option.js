module.exports = class Option {
  constructor(name, command) {
    if (!name) {
      throw new Error('Either a name or config is required to define an option')
    }

    let config = typeof name === 'string' ? { name } : name

    if (!config.name) {
      throw new Error('A name is required to define an option')
    }

    this.command = command
    this.config = {}
    this.set(config)
  }

  set(config) {
    let { name, alias, description, required } = config

    if (name) {
      this.name(name)
    }

    if (alias) {
      this.alias(alias)
    }

    if (description) {
      this.description(description)
    }

    if (typeof required !== 'undefined') {
      this.required(required)
    }

    return this
  }

  name(name) {
    if (typeof name !== 'string' || name.length === 0) {
      throw new TypeError('A name must be a non-empty string')
    }

    let config = this.config
    config.name = name
    config.names = config.aliases
      ? [config.name, ...config.aliases]
      : [config.name]

    return this
  }

  alias(alias) {
    let isArray = Array.isArray(alias)

    if (typeof alias !== 'string' || !isArray) {
      throw new TypeError(
        'The argument to alias() must be either a string or a non-empty array'
      )
    }

    if (alias.length === 0) {
      throw new Error('The argument to alias() must not be empty')
    }

    let config = this.config
    config.aliases = isArray ? alias : [alias]
    config.names = config.aliases
      ? [config.name, ...config.aliases]
      : [config.name]

    return this
  }

  description(description) {
    if (typeof description !== 'string' || description.length === 0) {
      throw new TypeError('A description must be a non-empty string')
    }

    this.config.description = description
    return this
  }

  required(value) {
    value = arguments.length === 0 || value ? true : false
    this.config.required = value
    return this
  }

  getConfig() {
    return Object.assign({}, this.config)
  }
}
