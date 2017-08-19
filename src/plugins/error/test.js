const assert = require('assert')
const {
  errorStartHandler, errorEndHandler, NO_HANDLER,
} = require('./index?private')
const errorPlugin = require('./index')


describe('error plugin', () => {
  it('hooks the handlers', () => {
    let generator = errorPlugin()
    let result = generator.next()

    assert.deepStrictEqual(result.value, {
      effect: 'hook',
      event: 'error',
      mode: 'start',
      fn: errorStartHandler,
    })

    result = generator.next()
    assert.deepStrictEqual(result.value, {
      effect: 'hook',
      event: 'error',
      mode: 'end',
      fn: errorEndHandler,
    })
  })

  describe('error start handler', () => {
    let config = {}
    let err = { event: {} }
    let generator = errorStartHandler(config, err)

    it('yields "next" with the proper args', () => {
      let { value } = generator.next()

      assert.deepStrictEqual(value, {
        effect: 'next',
        args: [config, err, err.event],
      })
    })

    it('prints the error and exits if an error is thrown when invoking the next handler', () => {
      /* eslint-disable no-console */

      let anotherErr = {}
      let result = generator.throw(anotherErr)

      assert.deepStrictEqual(result.value, {
        effect: 'call',
        fn: console.error,
        args: [anotherErr],
      })

      result = generator.next()

      assert.deepStrictEqual(result.value, {
        effect: 'call',
        fn: process.exit,
        args: [1],
      })
    })
  })

  describe('error end handler', () => {
    it('yields "next" with the proper args and returns the result', () => {
      let config = {}
      let err = { event: {} }
      let generator = errorEndHandler(config, err)
      let result = generator.next()
      let returnValue = {}

      assert.deepStrictEqual(result.value, {
        effect: 'next',
        args: [config, err],
        orValue: NO_HANDLER,
      })

      result = generator.next(returnValue)
      assert(result.value === returnValue)
      assert(result.done)
    })

    it('throws the error if there are no other handlers in the queue', () => {
      let config = {}
      let err = { event: {} }
      let generator = errorEndHandler(config, err)

      generator.next()
      assert.throws(() => {
        generator.next(NO_HANDLER)
      }, (_err) => _err === err)
    })
  })
})
