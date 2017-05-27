const { next } = require('hooter/effects')


module.exports = function errorPlugin(lifecycle) {
  ['init', 'start', 'execute'].forEach((event) => {
    lifecycle.hookBefore(event, function* (...args) {
      let errHandler

      if (event === 'execute') {
        errHandler = args[1]
        args.splice(1, 1)
      }

      try {
        return yield next(...args)
      } catch (err) {
        return lifecycle.tootSyncWith('error', (err, ...args) => {
          if (errHandler) {
            return errHandler(err, ...args)
          }

          /* eslint-disable no-console */
          console.error(err)
          process.exit(1)
        }, err)
      }
    })
  })
}
