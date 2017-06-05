function validateName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('An option name or alias must be a non-empty string')
  }

  if (name.charAt(0) === '-') {
    throw new Error(
      'A hyphen is not allowed as the first character of an option name or alias'
    )
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
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
  constructor(config, parent) {
    if (!parent) {
      throw new Error('An option must have a parent command')
    }

    let name

    if (config && typeof config === 'string') {
      name = config
      config = null
    } else if (config && typeof config === 'object') {
      name = config.name
    } else {
      throw new Error('The first argument of Command must be either a string or an object')
    }

    name = normalizeAndValidateName(name)

    this.parent = parent
    this.config = {
      name,
      id: `${parent.config.id}#${name}`,
    }

    if (config) {
      this.set(config)
    }
  }

  set(config) {
    let { aliases, description, required, type } = config

    if (aliases) {
      this.aliases(...aliases)
    }

    if (description) {
      this.description(description)
    }

    if (typeof required !== 'undefined') {
      this.required(required)
    }

    if (type) {
      this.type(type)
    }

    return this
  }

  aliases(...aliases) {
    aliases = aliases.map((a) => normalizeAndValidateName(a))

    if (this.parent) {
      let matchingSibling = this.parent.findOptionByAliases(aliases)

      if (matchingSibling) {
        let name = this.config.name
        aliases = aliases.join(', ')
        throw new Error(
          `Cannot set aliases "${aliases}" of the "${name}" option ` +
          `because it is already taken by "${matchingSibling.name}"`
        )
      }
    }

    this.config.aliases = aliases
    return this
  }

  description(description) {
    if (typeof description !== 'string' || description.length === 0) {
      throw new Error('A description must be a non-empty string')
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
      throw new Error('A type must be a non-empty string')
    }

    this.config.type = type
    return this
  }

  shared() {
    this.parent.shareOption(this.config.id)
    return this
  }

  command(...args) {
    return this.parent.command(...args)
  }

  option(...args) {
    return this.parent.option(...args)
  }

  handle(...args) {
    return this.parent.handle(...args)
  }

  end() {
    return this.parent
  }

  getConfig() {
    return this.config
  }
}

module.exports = Option
