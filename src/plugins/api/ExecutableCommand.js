const { next } = require('hooter/effects')
const Command = require('./Command')
const Option = require('./Option')


function buildConfig(rootCommand) {
  let commands = [rootCommand.getConfig()]
  let options = rootCommand.options.map((option) => option.getConfig())

  if (rootCommand.commands) {
    rootCommand.commands.forEach((command) => {
      let config = buildConfig(command)
      commands = commands.concat(config.commands)
      options = options.concat(config.options)
    })
  }

  return { commands, options }
}


class ExecutableCommand extends Command {
  on(command, handler) {
    if (!this.lifecycle || this.parent) {
      throw new Error('on() can only be used on the root command (the app)')
    }

    if (typeof command !== 'string' || !command) {
      throw new TypeError('A command pattern must be a string')
    }

    if (!/[a-z0-9._-]/.test(command)) {
      throw new Error(
        'A command pattern can only contain letters, numbers, underscores, hyphens and dots'
      )
    }

    if (command.charAt(0) === '-') {
      throw new Error(
        'A hyphen is not allowed as the first character of a command pattern'
      )
    }

    if (typeof handler !== 'function') {
      throw new TypeError('A handler must be a function')
    }

    this.lifecycle.hook(`handle.${command}`, function* (
      options,
      context,
      ...args
    ) {
      context = yield handler(options, context, ...args)
      return yield next(options, context, ...args).or(context)
    })

    return this
  }

  run(command, options, context) {
    if (!this.lifecycle || this.parent) {
      throw new Error('run() can only be used on the root command (the app)')
    }

    if (typeof command !== 'string' || command.length === 0) {
      throw new Error('A command must be a non-empty string')
    }

    options = options || {}
    return this.lifecycle.tootAsync('run', [{ command, options }], context)
  }

  start() {
    if (!this.lifecycle || this.parent) {
      throw new Error('start() can only be used on the root command (the app)')
    }

    return this.lifecycle.tootSyncWith(
      'start',
      (config) => config,
      buildConfig(this)
    )
  }
}

ExecutableCommand.Option = Option

module.exports = ExecutableCommand
