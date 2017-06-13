function normalizeName(name) {
  if (name.charAt(0) === '-') {
    name = name.substr(1)
  }

  if (name.charAt(0) === '-') {
    name = name.substr(1)
  }

  return name
}

class Option {
  constructor(name, parent) {
    if (!parent) {
      throw new Error('An option must have a parent command')
    }

    if (!name || typeof name !== 'string') {
      throw new Error('The first argument of Option must be a non-empty string')
    }

    name = normalizeName(name)
    this.parent = parent
    this.config = {
      name,
      id: `${parent.config.id}#${name}`,
    }
  }

  aliases(...aliases) {
    this.config.aliases = aliases.map((a) => normalizeName(a))
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
}

module.exports = Option
