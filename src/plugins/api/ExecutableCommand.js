const Command = require('./Command')
const Option = require('./Option')

class ExecutableCommand extends Command {
  on(command, handler) {
    if (!this.lifecycle) {
      throw new Error('on() cannot be used on a non-executable command')
    }

    if (typeof command !== 'string' || !command) {
      throw new TypeError('A command must be a string')
    }

    if (typeof handler !== 'function') {
      throw new TypeError('A handler must be a function')
    }

    return this.lifecycle.filter(`invoke.${command}`).subscribe((e) => {
      return handler(...e.args)
    })
  }

  run(command, options) {
    if (!this.lifecycle) {
      throw new Error('run() cannot be used on a non-executable command')
    }

    return this.lifecycle.tootAsync('run', command, options)
  }

  start() {
    if (!this.lifecycle) {
      throw new Error('start() cannot be used on a non-executable command')
    }

    return this.lifecycle.tootSync('start', this.getConfig())
  }
}

ExecutableCommand.Option = Option

module.exports = ExecutableCommand
