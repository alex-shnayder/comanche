const { findByIds, findOneByName } = require('../../common')


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
            arg: `-${body}`,
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

function extractFromCommandConfig(commandConfig, config) {
  let commands = findByIds(config.commands, commandConfig.commands)
  let options = findByIds(config.options, commandConfig.options)
  let positionalOptions = options.filter((option) => option.positional)
  return { commands, options, positionalOptions }
}

function parseArgs(args, config) {
  let defaultCommand = config.commands.find((c) => c.default)

  if (!defaultCommand) {
    throw new Error('No default command defined')
  }

  let {
    commands, options, positionalOptions,
  } = extractFromCommandConfig(defaultCommand, config)
  let currentResult = { command: defaultCommand.name, options: {} }
  let results = [currentResult]
  let noOptionsMode = false

  args = tokenizeArgs(args)

  for (let i = 0; i < args.length; i++) {
    let { kind, isLong, body, arg } = args[i]

    if (kind === '--') {
      noOptionsMode = true
    } else if (!noOptionsMode && kind === 'option') {
      let eqPos = body.indexOf('=')
      eqPos = eqPos === -1 ? undefined : eqPos
      let name = isLong ? body.substring(0, eqPos) : arg.charAt(1)
      let value

      if (!name) {
        throw new Error('Option name must not be empty')
      }

      let optionConfig = findOneByName(options, name)

      if (!optionConfig) {
        throw new Error(`Unknown option "${name}"`)
      }

      if (isLong && eqPos) {
        value = body.substr(eqPos + 1)
      } else if (optionConfig && optionConfig.type === 'boolean') {
        value = true
      } else if (optionConfig) {
        let nextArg = args[i + 1]

        if (nextArg && nextArg.kind === 'value') {
          i++
          value = nextArg.body
        }
      }

      currentResult.options[name] = value
    } else {
      let command = findOneByName(commands, body)

      if (command) {
        ({
          commands, options, positionalOptions,
        } = extractFromCommandConfig(command, config))
        currentResult = {
          command: `${currentResult.command}.${body}`,
          options: {},
        }
        results.push(currentResult)
      } else {
        let optionConfig = positionalOptions.shift()

        if (!optionConfig) {
          throw new Error(`Unknown argument "${arg}"`)
        }

        currentResult.options[optionConfig.name] = body
      }
    }
  }

  return results
}

module.exports = parseArgs
