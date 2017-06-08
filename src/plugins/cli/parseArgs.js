const {
  InputError, findByIds, findOneByAliases, findDefaultCommand,
} = require('../../common')


const CONSUME_BY_TYPE = {
  boolean: false,
  number: true,
  string: true,
  default: true,
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
  let defaultCommand = findDefaultCommand(config)

  if (!defaultCommand) {
    throw new Error('No default command defined')
  }

  let {
    commands, options, positionalOptions,
  } = extractFromCommandConfig(defaultCommand, config)
  let currentResult = {
    fullName: [defaultCommand.name],
    inputName: defaultCommand.name,
    options: [],
  }
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
      let value = null

      if (!name) {
        let err = new InputError('Option name must not be empty')
        err.command = currentResult
        throw err
      }

      let optionConfig = findOneByAliases(options, name)

      if (isLong && eqPos) {
        value = body.substr(eqPos + 1)
      } else if (!isLong && optionConfig) {
        let { consume, type } = optionConfig
        let nextArg = args[i + 1]

        if (type && (consume === null || typeof consume === 'undefined')) {
          consume = CONSUME_BY_TYPE[type]
        }

        if (typeof consume === 'undefined') {
          consume = CONSUME_BY_TYPE.default
        }

        if (consume && nextArg && nextArg.kind === 'value') {
          i++
          value = nextArg.body
        }
      }

      let inputName = arg
      currentResult.options.push({ name, inputName, value })
    } else {
      let command = findOneByAliases(commands, body)

      if (command) {
        ({
          commands, options, positionalOptions,
        } = extractFromCommandConfig(command, config))
        let fullName = currentResult.fullName.concat(body)
        currentResult = {
          fullName: fullName,
          inputName: fullName.join(' '),
          options: [],
        }
        results.push(currentResult)
      } else {
        let optionConfig = positionalOptions.shift()

        if (!optionConfig) {
          let err = new InputError(`Unknown argument "${arg}"`)
          err.command = currentResult
          throw err
        }

        currentResult.options.push({
          name: optionConfig.name,
          inputName: optionConfig.name,
          value: body,
        })
      }
    }
  }

  return results
}

module.exports = parseArgs
