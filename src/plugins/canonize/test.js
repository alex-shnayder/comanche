const assert = require('assert')
const { processHandler, canonize } = require('./index?private')
const canonizePlugin = require('./index')


describe('canonize plugin', () => {
  it('hooks the process handler', () => {
    let generator = canonizePlugin()
    let { value } = generator.next()

    assert.deepStrictEqual(value, {
      effect: 'hook',
      event: 'process',
      mode: 'end',
      handler: processHandler,
    })
  })

  describe('process handler', () => {
    let config = {}
    let command = {}
    let generator = processHandler(config, command)

    it('calls canonize', () => {
      let { value } = generator.next()

      assert.deepStrictEqual(value, {
        effect: 'call',
        fn: canonize,
        args: [command],
      })
    })

    it('yields "next" with the canonized command', () => {
      let canonizedCommand = {}
      let { value } = generator.next(canonizedCommand)

      assert.deepStrictEqual(value, {
        effect: 'next',
        args: [config, canonizedCommand],
      })
    })

    it('returns the result', () => {
      let result = {}
      let { value, done } = generator.next(result)

      assert(value === result)
      assert(done)
    })
  })

  describe('canonize', () => {
    it('returns the given command if it has no config or options', () => {
      let command = {}
      let result = canonize(command)

      assert(command === result)
    })

    it('sets the command\'s output name to its canonical form', () => {
      let command = {
        fullName: ['foo', 'bar'],
        config: {
          name: 'baz',
        },
      }
      let result = canonize(command)

      assert.deepStrictEqual(result, {
        fullName: ['foo', 'bar'],
        outputName: ['foo', 'baz'],
        config: {
          name: 'baz',
        },
      })
    })

    it('sets the output names of command\'s options to the names defined in their configs', () => {
      let command = {
        options: [{
          outputName: 'foo',
          config: {
            name: 'oof',
          },
        }, {
          outputName: 'bar',
        }],
      }
      let result = canonize(command)

      assert.deepStrictEqual(result, {
        options: [{
          outputName: 'oof',
          config: {
            name: 'oof',
          },
        }, {
          outputName: 'bar',
        }],
      })
    })
  })
})
