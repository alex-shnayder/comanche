module.exports.findMatch = (haystack, needle) => {
  if (!Array.isArray(haystack)) {
    throw new Error('A haystack must be an array of commands or options')
  }

  let isString = (typeof needle === 'string')
  let isObject = (typeof needle === 'object')

  if (!needle || (!isString && !isObject)) {
    throw new Error('A needle must be either a string or an object')
  }

  if (isString) {
    return haystack.find((item) => {
      let { name, alias } = item
      return (name === needle || (alias && alias.includes(needle)))
    })
  }

  let names = needle.alias ? needle.alias.concat(needle.name) : [needle.name]

  return haystack.find((item) => {
    let { name, alias } = item
    let itemNames = alias ? alias.concat(name) : [name]
    return names.find((n) => itemNames.includes(n))
  })
}
