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

function extractOptions(options) {
  let positionalOptions = []
  let optionsByName = {}

  options.forEach((option) => {
    option.names.forEach((name) => (optionsByName[name] = option))

    if (option.positional) {
      positionalOptions.push(option)
    }
  })
  return { positionalOptions, optionsByName }
}

function parseArgs(args, config) {
  let noOptionsMode = false
  let currentName = config.name
  let currentOptions = {}
  let currentResult = { command: currentName, options: currentOptions }
  let results = [currentResult]
  let { positionalOptions, optionsByName } = extractOptions(config.options)
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

      let optionConfig = optionsByName[name]
      name = optionConfig ? optionConfig.name : name

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

      currentOptions[name] = value
    } else {
      let command = config.commands.find((command) => {
        return command.names.includes(arg)
      })

      if (command) {
        currentName += '.' + command.name
        currentOptions = {}
        currentResult = { command: currentName, options: currentOptions }
        results.push(currentResult)

        let extractedOptions = extractOptions(command.options)
        positionalOptions = extractedOptions.positionalOptions
        optionsByName = extractedOptions.optionsByName
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

module.exports = parseArgs
