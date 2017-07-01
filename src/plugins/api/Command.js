class Command {
  constructor(name, parent) {
    if (!name || typeof name !== 'string') {
      throw new Error('The first argument of the Command constructor must be its name (a non-empty string)')
    }

    this.config = {
      name,
      id: parent ? `${parent.config.id}.${name}` : name,
      commands: [],
      options: [],
    }

    this.parent = parent
    this.commands = []
    this.options = []
    this.sharedSettings = []
    this.sharedOptions = []

    if (!parent) {
      let inheritableSettings = this.constructor.inheritableSettings
      let inheritableOptions = this.constructor.inheritableOptions

      if (inheritableSettings && inheritableSettings.length) {
        this.sharedSettings = inheritableSettings.slice()
      }

      if (inheritableOptions && inheritableOptions.length) {
        this.sharedOptions = inheritableOptions.slice()
      }
    }
  }

  aliases(...aliases) {
    this.config.aliases = aliases
    return this
  }

  share(...settings) {
    this.sharedSettings.push(...settings)
    return this
  }

  command(config) {
    let command = new this.constructor(config, this)
    this.commands.push(command)
    this.config.commands.push(command.config.id)
    return command
  }

  option(config, description) {
    let name, aliases

    if (Array.isArray(config)) {
      aliases = config
      name = aliases.shift()
    } else if (typeof config === 'string') {
      aliases = config.split(', ')
      name = aliases.shift()
    }

    let option = new this.constructor.Option(name, this)

    if (aliases && aliases.length) {
      option.aliases(...aliases)
    }

    if (description) {
      option.description(description)
    }

    this.options.push(option)
    this.config.options.push(option.config.id)
    return option
  }

  end() {
    return this.parent
  }
}

module.exports = Command
