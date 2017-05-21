function findMatch(items, needle) {
  let names = needle.alias ? needle.alias.concat(needle.name) : [needle.name]

  return items.find((item) => {
    let { name, alias } = item
    return names.find((n) => n === name || (alias && alias.includes(n)))
  })
}

module.exports = {
  findMatch,
}
