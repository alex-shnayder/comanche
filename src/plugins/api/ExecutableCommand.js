const Command = require('./Command')
const Option = require('./Option')

class ExecutableCommand extends Command {
  on(command, handler) {
    if (!this.lifecycle || this.parent) {
      throw new Error('on() can only be used on the root command (the app)')
    }

    if (typeof command !== 'string' || !command) {
      throw new TypeError('A command must be a string')
    }

    if (command.includes('*') || command.includes(' ')) {
      throw new TypeError('A command must not contain asterisks or spaces')
    }

    if (typeof handler !== 'function') {
      throw new TypeError('A handler must be a function')
    }

    return this.lifecycle.filter(`invoke.${command}`).subscribe((e) => {
      return handler(...e.args)
    })
  }

  run(command, options) {
    if (!this.lifecycle || this.parent) {
      throw new Error('run() can only be used on the root command (the app)')
    }

    return this.lifecycle.tootAsync('run', command, options)
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
