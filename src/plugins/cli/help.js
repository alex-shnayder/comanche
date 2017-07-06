const { wrap, formatColumns } = require('./utils')


const PADDING = 2
const COLUMNS_CONFIG = {
  padding: PADDING,
  columnWidths: [30],
}


let texts = {}

function makeUsageText(commandName, commandConfig) {
  let text = commandName
  let { options, commands, description } = commandConfig

  if (options && options.length) {
    text += ' [options]'

    options.forEach(({ name, positional, required }) => {
      if (positional) {
        text += required ? ` <${name}>` : ` [${name}]`
      }
    })
  }

  if (commands && commands.length) {
    text += ' [command]'
  }

  text = `Usage:\n${wrap(text, null, PADDING)}`

  if (description) {
    text = `${wrap(description)}\n\n${text}`
  }

  return text
}

function makeCommandsText(commands) {
  let rows = commands.map((command) => {
    let { name, aliases, description } = command
    let names = aliases ? [name].concat(aliases) : [name]
    return [names.join(', '), description || '']
  })
  let rowsText = formatColumns(rows, COLUMNS_CONFIG)

  return `Commands:\n${rowsText}`
}

function makeOptionsText(options) {
  let rows = options
    .sort((option) => {
      return option.isHelpOption ? 1 : 0
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

      return [namesText, description]
    })

  let rowsText = formatColumns(rows, COLUMNS_CONFIG)
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
