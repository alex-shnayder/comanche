const camelCase = require('camel-case')

module.exports.normalizeCommandName = (name) => {
  return camelCase(name)
}

module.exports.normalizeOptionName = (name) => {
  if (name.charAt(0) === '-') {
    name = name.substr(1)
  }

  if (name.charAt(0) === '-') {
    name = name.substr(1)
  }

  return camelCase(name)
}
