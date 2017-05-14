const { next } = require('hooter/effects')
const Command = require('./Command')
const Option = require('./Option')

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

    return this.lifecycle.hook(`invoke.${command}`, function* (
      options,
      context,
      ...args
    ) {
      context = yield handler(options, context, ...args)
      return yield next(options, context, ...args).or(context)
    })
  }

  run(command, options, context) {
    if (!this.lifecycle || this.parent) {
      throw new Error('run() can only be used on the root command (the app)')
    }

    return this.lifecycle.tootAsync('run', [{ command, options }], context)
  }

  start() {
    if (!this.lifecycle || this.parent) {
      throw new Error('start() can only be used on the root command (the app)')
    }

    return this.lifecycle.tootSync('start', this.getConfig())
  }
}

ExecutableCommand.Option = Option

module.exports = ExecutableCommand
