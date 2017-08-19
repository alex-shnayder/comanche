const assert = require('assert')
const { configureHandler, setProcessTitle } = require('./index?private')
const processTitlePlugin = require('./index')


describe('processTitle plugin', () => {
  it('hooks the configure handler', () => {
    let generator = processTitlePlugin()
    let { value } = generator.next()

    assert.deepStrictEqual(value, {
      effect: 'hook',
      event: 'configure',
      mode: 'start',
      fn: configureHandler,
    })
  })

  describe('configure handler', () => {
    let schema = {}
    let config = {}
    let generator = configureHandler(schema, config)

    it('calls setProcessTitle', () => {
      let { value } = generator.next()

      assert.deepStrictEqual(value, {
        effect: 'call',
        fn: setProcessTitle,
        args: [config],
      })
    })

    it('yields "next"', () => {
      let { value } = generator.next()

      assert.deepStrictEqual(value, {
        effect: 'next',
        args: [schema, config],
      })
    })

    it('returns the result', () => {
      let result = {}
      let { value, done } = generator.next(result)

      assert(value === result)
      assert(done)
    })
  })

  describe('setProcessTitle', () => {
    it('sets the process title to the name of the default command if it exists', () => {
      let config = {
        commands: [{
          name: 'foo',
        }, {
          name: 'bar',
          default: true,
        }, {
          name: 'baz',
        }],
      }

      let originalTitle = process.title
      setProcessTitle(config)
      assert(process.title === 'bar')
      process.title = originalTitle
    })

    it('doesn\'t do anything if there is no default command', () => {
      let config = {
        commands: [{
          name: 'foo',
        }, {
          name: 'bar',
        }],
      }

      let originalTitle = process.title
      process.title = 'baz'
      setProcessTitle(config)
      assert(process.title === 'baz')
      process.title = originalTitle
    })
  })
})
