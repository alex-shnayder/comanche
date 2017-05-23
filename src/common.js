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

function findOneByName(items, field, name) {
  if (arguments.length === 2) {
    return findOneByAliases(items, field)
  } else if (typeof name === 'string') {
    return findOneByAliases(items, name)
  }

  let result

  for (let i = 0; i < name.length && items.length; i++) {
    result = findOneByName(items, name[i])

    if (result) {
      items = findByIds(items, result[field])
    }
  }

  return result
}

module.exports = {
  findByIds, findOneById, findOneByAliases, findOneByName,
}
