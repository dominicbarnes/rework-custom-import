/* eslint-env mocha */

'use strict'

let assert = require('assert')
let fs = require('fs')
let path = require('path')
let rework = require('rework')
let plugin = require('..')

let fixture = path.resolve.bind(path, __dirname, 'fixtures')
const fixtures = fs.readdirSync(fixture())

describe('rework-custom-import', function () {
  fixtures.forEach(function (name) {
    let spec = load(name)

    it(spec.description, function () {
      if (spec.error) {
        assert.throws(run, new RegExp(spec.error))
      } else {
        run()
      }
    })

    function run () {
      let actual = rework(spec.input, { source: 'input.css' })
        .use(plugin(spec.mapping))
        .toString()

      assert.equal(actual.trim(), spec.expected.trim())
    }
  })
})

function load (name) {
  let base = json(fixture(name, 'spec.json'))
  let input = read(fixture(name, 'input.css'))
  let mapping = json(fixture(name, 'mapping.json'))
  if (base.buffer) bufferify(mapping)
  let expected = read(fixture(name, 'expected.css'))

  return Object.assign(base, {
    input: input,
    expected: expected,
    mapping: mapping
  })
}

function bufferify (mapping) {
  for (let key of Object.keys(mapping)) {
    let source = mapping[key].source
    mapping[key].source = new Buffer(source)
  }
}

function json (file) {
  return JSON.parse(read(file))
}

function read (file) {
  return fs.readFileSync(file, 'utf8')
}
