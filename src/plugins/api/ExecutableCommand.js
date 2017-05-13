const Command = require('./Command')
const Option = require('./Option')

class ExecutableCommand extends Command {
  constructor(lifecycle, name, parent) {
    super(name, parent)
    this.lifecycle = lifecycle
  }

  on(command, handler) {
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
    return this.lifecycle.tootAsync('run', command, options)
  }

  start() {
    return this.lifecycle.tootSync('start', this.getConfig())
  }
}

ExecutableCommand.Option = Option

module.exports = ExecutableCommand
