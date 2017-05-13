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
    this.set(config)
  }

  set(config) {
    let { name, alias, description, commands, options } = config

    if (name) {
      this.name(name)
    }

    if (alias) {
      this.alias(alias)
    }

    if (description) {
      this.description(description)
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
    if (typeof name !== 'string' || name.length === 0) {
      throw new TypeError('A name must be a non-empty string')
    }

    this.config.name = name
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

    this.config.alias = isArray ? alias : [alias]
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

  getConfig() {
    let config = this.config
    let names = config.alias ? [config.name, ...config.alias] : [config.name]

    return Object.assign(
      {
        names,
        commands: this.commands.map((command) => command.build()),
        options: this.options.map((option) => option.build()),
      },
      this.config
    )
  }
}

module.exports = Command
