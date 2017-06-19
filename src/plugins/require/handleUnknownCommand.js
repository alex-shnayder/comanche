const { InputError, findCommandByFullName } = require('../../common')
const findLevenshtein = require('./findLevenshtein')


const LEVENSHTEIN_THRESHOLD = 3


function suggestCommand(inputCommand, commands) {
  let bestDistance = Infinity
  let suggested

  commands.forEach((command) => {
    let { name, aliases } = command
    let names = aliases ? aliases.concat(name) : [name]

    names.forEach((name) => {
      let distance = findLevenshtein(inputCommand, name)

      if (distance <= LEVENSHTEIN_THRESHOLD && distance < bestDistance) {
        bestDistance = distance
        suggested = name
      }
    })
  })

  return suggested
}

module.exports = function handleUnknownCommand(config, command) {
  let { fullName, inputName } = command
  let name = fullName[fullName.length - 1]
  let parentFullName = fullName.slice(0, -1)
  let parentCommand = findCommandByFullName(config, parentFullName, true)
  let siblings = parentCommand.commands
  let errText = `Unknown command "${inputName}"`

  if (siblings && siblings.length) {
    let suggested = suggestCommand(name, siblings)

    if (suggested) {
      errText += `. Did you mean "${suggested}"?`
    }
  }

  throw new InputError(errText)
}
