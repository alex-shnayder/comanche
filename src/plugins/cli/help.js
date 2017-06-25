const cliff = require('cliff')


const PADDING = 2
const GAP = 5


let texts = {}

function makeUsageText(commandName, commandConfig) {
  let text = `Usage: ${commandName}`

  if (!commandConfig) {
    return text
  }

  let { options, commands, description } = commandConfig

  if (options && options.length) {
    let positionalText = ''
    let hasNonPositionalOptions = false

    options.forEach(({ name, positional, long, short, required }) => {
      if (positional) {
        positionalText += required ? ` <${name}>` : ` [${name}]`
      }

      if (long || short) {
        hasNonPositionalOptions = true
      }
    })

    if (hasNonPositionalOptions) {
      text += ' [options]'
    }

    text += positionalText
  }

  if (commands && commands.length) {
    text += ' [command]'
  }

  if (description) {
    text += `\n\n${description}`
  }

  return text
}

function makeCommandsText(commands) {
  let rows = commands.map((command) => {
    let { name, aliases, description } = command
    let names = aliases ? [name].concat(aliases) : [name]
    let namesText = names.join(', ')
    namesText = ' '.repeat(PADDING) + namesText
    return [namesText, description || '']
  })

  let rowsText = cliff.stringifyRows(rows, null, {
    columnSpacing: GAP,
  })
  return `Commands:\n${rowsText}`
}

function makeOptionsText(options) {
  let rows = options
    .sort((o) => {
      return o.isHelpOption ? 1 : 0
    })
    .map((option) => {
      let { name, aliases, description } = option
      let names = aliases ? [name].concat(aliases) : [name]
      let namesText = names
        .sort((a, b) => a.length - b.length)
        .map((name) => {
          return (name.length === 1) ? `-${name}` : `--${name}`
        })
        .join(', ')
      namesText = ' '.repeat(PADDING) + namesText
      return [namesText, description || '']
    })

  let rowsText = cliff.stringifyRows(rows, null, {
    columnSpacing: GAP,
  })
  return `Options:\n${rowsText}`
}


module.exports = function composeHelp(commandConfig, commandName) {
  commandName = commandName || commandConfig.name

  if (texts[commandConfig.id]) {
    return texts[commandConfig.id]
  }

  let { options, commands } = commandConfig
  let text = makeUsageText(commandName, commandConfig)

  if (commands && commands.length) {
    text += `\n\n${makeCommandsText(commands)}`
  }

  if (options && options.length) {
    text += `\n\n${makeOptionsText(options)}`
  }

  texts[commandConfig.id] = text
  return text
}
