const assert = require('assert')
const { format } = require('util')
const {
  CORE_PLUGINS, DEFAULT_PLUGINS, CORE_AND_DEFAULT_PLUGINS,
} = require('../pluginize?private')
const pluginize = require('../pluginize')
const camelizePlugin = require('../plugins/camelize')


function pluginA() {}
function* pluginB() {}


function compareArrays(arrayA, arrayB) {
  assert(arrayA.length === arrayB.length)
  arrayA.forEach((item, i) => {
    assert(item === arrayB[i])
  })
}

function stringifyArgs(args) {
  return args
    .map((arg) => {
      if (typeof arg === 'function') {
        return arg.name
      } else if (typeof arg === 'string') {
        return `"${arg}"`
      } else {
        return format(arg)
      }
    })
    .join(', ')
}


describe('pluginize', () => {
  let testsToPass = [
    {
      args: [],
      expected: CORE_AND_DEFAULT_PLUGINS,
    }, {
      args: [pluginA, pluginB],
      expected: CORE_AND_DEFAULT_PLUGINS.concat(pluginA, pluginB),
    }, {
      args: [pluginA, pluginB, pluginA],
      expected: CORE_AND_DEFAULT_PLUGINS.concat(pluginA, pluginB, pluginA),
    }, {
      args: [false],
      expected: CORE_PLUGINS,
    }, {
      args: [false, pluginA],
      expected: CORE_PLUGINS.concat(pluginA),
    }, {
      args: [pluginA, false],
      expected: CORE_PLUGINS.concat(pluginA),
    }, {
      args: [false, pluginA, true],
      expected: CORE_PLUGINS.concat(pluginA).concat(DEFAULT_PLUGINS),
    }, {
      args: [pluginA, '-camelize'],
      expected: CORE_AND_DEFAULT_PLUGINS
        .concat(pluginA)
        .filter((p) => p !== camelizePlugin),
    }, {
      args: [false, pluginA, true, '-camelize', pluginB],
      expected: CORE_PLUGINS
        .concat(pluginA)
        .concat(DEFAULT_PLUGINS)
        .filter((p) => p !== camelizePlugin)
        .concat(pluginB),
    },
  ]
  let testsToFail = [
    ['foo'],
    [false, '-bar'],
    [{}],
    [false, pluginA, [], true],
  ]

  testsToPass.forEach(({ args, expected }) => {
    it(`works for [${stringifyArgs(args)}]`, () => {
      compareArrays(pluginize(args), expected)
    })
  })

  testsToFail.forEach((args) => {
    it(`throws for [${stringifyArgs(args)}]`, () => {
      assert.throws(() => {
        pluginize(args)
      })
    })
  })
})
