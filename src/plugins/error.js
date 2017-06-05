const { next } = require('hooter/effects')


const NO_HANDLER = {}


module.exports = function errorPlugin(lifecycle) {
  lifecycle.hookEnd('error', function* (err, ...args) {
    let result = yield next(err, ...args).or(NO_HANDLER)

    if (result === NO_HANDLER) {
      throw err
    }

    return result
  })

  lifecycle.hookStart('error', function* (err, ...args) {
    try {
      yield next(err, err.event, ...args)
    } catch (err) {
      /* eslint-disable no-console */
      console.error(err)
      process.exit(1)
    }
  })
}
