const { next } = require('hooter/effects')


const NO_HANDLER = {}


module.exports = function errorPlugin(lifecycle) {
  lifecycle.hookEnd('error', function* (_, err, ...args) {
    let result = yield next(_, err, ...args).or(NO_HANDLER)

    if (result === NO_HANDLER) {
      throw err
    }

    return result
  })

  lifecycle.hookStart('error', function* (_, err, ...args) {
    try {
      yield next(_, err, err.event, ...args)
    } catch (err) {
      /* eslint-disable no-console */
      console.error(err)
      process.exit(1)
    }
  })
}
