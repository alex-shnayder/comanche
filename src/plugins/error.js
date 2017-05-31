const { next } = require('hooter/effects')


function handleError(err) {
  /* eslint-disable no-console */
  console.error(err)
  process.exit(1)
}

module.exports = function errorPlugin(lifecycle) {
  ['init', 'start', 'execute'].forEach((event) => {
    lifecycle.hookStart(event, function* (...args) {
      let errHandler = (event === 'execute' && args[1]) ? args[1] : handleError

      try {
        return yield next(...args)
      } catch (err) {
        return lifecycle.tootWith('error', errHandler, err)
      }
    })
  })
}
