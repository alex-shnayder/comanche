const cliff = require('cliff')


const PADDING = 2
const GAP = 5


let texts = {}

function makeUsageText(commandName, commandConfig) {
  let text = `Usage: ${commandName}`

  if (!commandConfig || !commandConfig.description) {
    return text
  }

  return `${text}\n\n${commandConfig.description}`
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
    .sort((a) => {
      return a.isHelpOption ? 1 : 0
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


module.exports = function composeHelp(commandName, commandConfig) {
  if (!commandConfig) {
    return `Command "${commandName}" is unknown`
  }

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
