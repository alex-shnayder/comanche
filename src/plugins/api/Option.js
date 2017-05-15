function validateName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('An option name or alias must be a non-empty string')
  }

  if (name.charAt(0) === '-') {
    throw new Error(
      'A hyphen is not allowed as the first character of an option name or alias'
    )
  }

  if (!/[a-z0-9_-]/.test(name)) {
    throw new Error(
      'An option name or alias may only contain letters, numbers, underscores and hyphens'
    )
  }
}

function normalizeName(name) {
  if (name.charAt(0) === '-') {
    name = name.substr(1)
  }

  if (name.charAt(0) === '-') {
    name = name.substr(1)
  }

  return name
}

function normalizeAndValidateName(name) {
  name = normalizeName(name)
  validateName(name)
  return name
}

class Option {
  constructor(name, command) {
    if (!name) {
      throw new Error('Either a name or config is required to define an option')
    }

    let config = typeof name === 'string' ? { name } : name

    if (!config.name) {
      throw new Error('A name is required to define an option')
    }

    this.command = command
    this.config = {
      type: 'boolean',
    }
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
    name = normalizeAndValidateName(name)

    let config = this.config
    config.name = name
    config.names = config.alias ? [config.name, ...config.alias] : [config.name]

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
      alias = alias.map((a) => normalizeAndValidateName(a))
    } else {
      alias = [normalizeAndValidateName(alias)]
    }

    let config = this.config
    config.alias = isArray ? alias : [alias]
    config.names = config.alias ? [config.name, ...config.alias] : [config.name]

    return this
  }

  description(description) {
    if (typeof description !== 'string' || description.length === 0) {
      throw new TypeError('A description must be a non-empty string')
    }

    this.config.description = description
    return this
  }

  required(value = true) {
    if (typeof value !== 'boolean') {
      throw new Error('The argument of required() must be boolean')
    }

    this.config.required = value
    return this
  }

  type(type) {
    if (!type || typeof type !== 'string') {
      throw new TypeError('A type must be a non-empty string')
    }

    this.config.type = type
  }

  option(...args) {
    return this.command.option(...args)
  }

  getConfig() {
    return Object.assign({}, this.config)
  }
}

module.exports = Option
