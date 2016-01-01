
'use strict';

let assert = require('assert');
let fs = require('fs');
let path = require('path');
let rework = require('rework');
let plugin = require('..');

let fixture = path.resolve.bind(path, __dirname, 'fixtures');
const fixtures = fs.readdirSync(fixture());


describe('rework-custom-import', function () {
  fixtures.forEach(function (name) {
    let spec = load(name);

    it(spec.description, function () {
      let actual = rework(spec.input, { source: 'input.css' })
        .use(plugin(spec.mapping))
        .toString();

      assert.equal(actual.trim(), spec.expected.trim());
    });
  });
});

function load(name) {
  return Object.assign(json(fixture(name, 'spec.json')), {
    input: read(fixture(name, 'input.css')),
    expected: read(fixture(name, 'expected.css')),
    mapping: json(fixture(name, 'mapping.json'))
  });
}

function json(file) {
  return JSON.parse(read(file));
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}
