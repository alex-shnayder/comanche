const assert = require('assert')
const { processHandler, camelizeOptions } = require('./index?private')
const camelizePlugin = require('./index')


describe('camelize plugin', () => {
  it('hooks the process handler', () => {
    let generator = camelizePlugin()
    let { value } = generator.next()

    assert.deepStrictEqual(value, {
      effect: 'hook',
      event: 'process',
      mode: 'end',
      fn: processHandler,
    })
  })

  describe('process handler', () => {
    let config = {}
    let command = {}
    let generator = processHandler(config, command)

    it('calls camelizeOptions', () => {
      let { value } = generator.next()

      assert.deepStrictEqual(value, {
        effect: 'call',
        fn: camelizeOptions,
        args: [command],
      })
    })

    it('yields "next" with the camelized command', () => {
      let camelizedCommand = {}
      let { value } = generator.next(camelizedCommand)

      assert.deepStrictEqual(value, {
        effect: 'next',
        args: [config, camelizedCommand],
      })
    })

    it('returns the result', () => {
      let result = {}
      let { value, done } = generator.next(result)

      assert(value === result)
      assert(done)
    })
  })

  describe('camelizeOptions', () => {
    it('returns the given command if it has no options', () => {
      let command = {}
      let result = camelizeOptions(command)
      assert(command === result)
    })

    it('converts the command\'s options to camelCase', () => {
      let command = {
        options: [{
          name: 'foo-bar',
        }],
      }
      let result = camelizeOptions(command)

      assert.deepStrictEqual(result, {
        options: [{
          name: 'fooBar',
        }],
      })
    })
  })
})
