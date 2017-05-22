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

function findOneByName(items, names) {
  if (Array.isArray(names)) {
    return items.find((item) => {
      let { name, alias } = item
      return names.find((n) => n === name || (alias && alias.includes(n)))
    })
  }

  return items.find((item) => {
    return item.name === names || (item.alias && item.alias.includes(names))
  })
}

module.exports = {
  findByIds, findOneById, findOneByName,
}
