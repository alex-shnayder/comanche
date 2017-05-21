function findByIds(items, ids) {
  return ids
    .map((id) => {
      return items.find((item) => item.id === id)
    })
    .filter((item) => item)
}

function findOneById(items, id) {
  return items.find((item) => item.id === id)
}

function findOneByName(items, name) {
  return items.find((item) => {
    return item.name === name || (item.alias && item.alias.includes(name))
  })
}

function findMatch(items, needle) {
  let names = needle.alias ? needle.alias.concat(needle.name) : [needle.name]

  return items.find((item) => {
    let { name, alias } = item
    return names.find((n) => n === name || (alias && alias.includes(n)))
  })
}

module.exports = {
  findByIds, findOneById, findOneByName, findMatch,
}
