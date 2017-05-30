const cliff = require('cliff')


const PADDING = 2
const GAP = 5


let texts = {}

function makeUsageText(command) {
  let { config, inputName } = command
  let text = `Usage: ${inputName}`

  if (!config || !config.description) {
    return text
  }

  return `${text}\n\n${config.description}`
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


module.exports = function composeHelp(command) {
  let { config, inputName } = command

  if (!config) {
    return `Command "${inputName} is unknown`
  }

  if (texts[config.id]) {
    return texts[config.id]
  }

  let { options, commands } = config
  let text = `\n${makeUsageText(command)}\n`

  if (commands && commands.length) {
    text += `\n${makeCommandsText(commands)}\n`
  }

  if (options && options.length) {
    text += `\n${makeOptionsText(options)}\n`
  }

  texts[config.id] = text
  return text
}
