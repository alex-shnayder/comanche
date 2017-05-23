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

function findOneByAliases(items, aliases) {
  if (Array.isArray(aliases)) {
    return items.find((item) => {
      let { name, alias } = item
      return aliases.find((n) => n === name || (alias && alias.includes(n)))
    })
  }

  return items.find((item) => {
    return item.name === aliases || (item.alias && item.alias.includes(aliases))
  })
}

module.exports = {
  findByIds, findOneById, findOneByAliases,
}
