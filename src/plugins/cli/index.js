const { next } = require('hooter/effects')

module.exports = function cliPlugin(lifecycle) {
  lifecycle.hook('start', function* (config) {
    yield next(config)

    let args = process.argv.slice(2)
    let commands = parseArgs(args, config)
    lifecycle.tootAsync('run', commands)
  })
}

function tokenizeArgs(args) {
  return args.reduce((results, arg) => {
    let isOption = arg.charAt(0) === '-'

    if (isOption && arg.charAt(1) === '-') {
      let body = arg.substr(2)

      if (body) {
        results.push({ kind: 'option', isLong: true, body, arg })
      } else {
        results.push({ kind: '--', body: arg, arg })
      }
    } else if (isOption) {
      let body = arg.substr(1)

      if (body) {
        body.split('').forEach((body) => {
          results.push({
            kind: 'option',
            isLong: false,
            arg: '-' + body,
            body,
          })
        })
      }
    } else {
      results.push({ kind: 'value', body: arg, arg })
    }

    return results
  }, [])
}

function convertConfig(config) {
  let positionalOptions = []
  let optionsByName = {}

  config.options.forEach((option) => {
    option.names.forEach((name) => (optionsByName[name] = option))

    if (option.positional) {
      positionalOptions.push(option)
    }
  })
  return { positionalOptions, optionsByName }
}

function parseArgs(args, config) {
  let noOptioneMode = false
  let currentName = config.name
  let currentOptions = {}
  let currentResult = { command: currentName, options: currentOptions }
  let results = [currentResult]
  let { positionalOptions, optionsByName } = convertConfig(config)
  args = tokenizeArgs(args)

  for (let i = 0; i < args.length; i++) {
    let { kind, isLong, body, arg } = args[i]

    if (kind === '--') {
      noOptioneMode = true
    } else if (!noOptioneMode && kind === 'option') {
      let eqPos = body.indexOf('=')
      eqPos = eqPos === -1 ? undefined : eqPos
      let name = isLong ? body.substring(0, eqPos) : arg.charAt(1)
      let optionConfig = optionsByName[name]
      let value

      if (!name) {
        throw new Error('Option name must not be empty')
      }

      if (!optionConfig) {
        throw new Error(`Unknown option "${name}"`)
      }

      if (isLong && eqPos) {
        value = body.substr(eqPos + 1)
      } else if (optionConfig.type === 'boolean') {
        value = true
      } else {
        let nextArg = args[i + 1]

        if (nextArg && nextArg.kind === 'value') {
          i++
          value = nextArg.body
        }
      }

      currentOptions[optionConfig.name] = value
    } else {
      let command = config.commands.find((command) => command.name === arg)

      if (command) {
        currentName += '.' + command.name
        currentOptions = {}
        currentResult = { command: currentName, options: currentOptions }
        results.push(currentResult)

        let convertedConfig = convertConfig(command)
        positionalOptions = convertedConfig.positionalOptions
        optionsByName = convertedConfig.optionsByName
      } else {
        let optionConfig = positionalOptions.shift()

        if (!optionConfig) {
          throw new Error(`Unknown argument "${arg}"`)
        }

        currentOptions[optionConfig.name] = body
      }
    }
  }

  return results
}
