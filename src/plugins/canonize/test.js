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
        args: [config, command],
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
    it('sets the command\'s name to its canonical form', () => {
      let config = {
        commands: [{
          id: 1,
          name: 'for',
          aliases: ['foo'],
          commands: [2],
        }, {
          id: 2,
          name: 'baz',
          aliases: ['bar'],
        }],
      }
      let command = {
        fullName: ['foo', 'bar'],
        config: config.commands[1],
      }
      let result = canonize(config, command)

      assert.deepStrictEqual(result, {
        fullName: ['for', 'baz'],
        config: config.commands[1],
      })
    })

    it('sets the names of the command\'s options to the names defined in their configs', () => {
      let config = {
        commands: [],
      }
      let command = {
        fullName: [],
        options: [{
          name: 'foo',
          config: {
            name: 'oof',
          },
        }, {
          name: 'bar',
        }],
      }
      let result = canonize(config, command)

      assert.deepStrictEqual(result, {
        fullName: [],
        options: [{
          name: 'oof',
          config: {
            name: 'oof',
          },
        }, {
          name: 'bar',
        }],
      })
    })
  })
})
