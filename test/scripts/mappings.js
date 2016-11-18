
/**
 * This script generates the `mapping.json` for each `test/fixtures/` directory.
 *
 * Basically, any css other than `expected.css` will be combined into a browser-pack style
 * module-deps object and then written as `mapping.json`.
 */

'use strict';

let css = require('css');
let fs = require('fs');
let isUrl = require('is-url');
let glob = require('glob');
let parse = require('parse-import');
let path = require('path');

let fixture = path.resolve.bind(path, __dirname, '../fixtures');

fs.readdirSync(fixture()).forEach(function (name) {
  let files = glob.sync(fixture(name, '*.css'), { ignore: '**/expected.css' });

  let mapping = files.reduce(function (acc, file) {
    let id = path.relative(fixture(name), file);
    let source = fs.readFileSync(file, 'utf8');
    acc[id] = {
      id: id,
      source: source,
      deps: deps(source),
      entry: id === 'input.css'
    };
    return acc;
  }, {});

  fs.writeFileSync(fixture(name, 'mapping.json'), JSON.stringify(mapping, null, 2));
});

function deps(source) {
  return css.parse(source).stylesheet.rules
    .filter(rule => rule.type === 'import')
    .map(rule => parse(`@import ${rule.import};`).shift())
    .reduce(function (acc, data) {
      if (isUrl(data.path)) {
        acc[data.path] = false;
      } else if (data.path !== 'IGNORE') {
        acc[data.path] = path.normalize(data.path);
      }
      return acc;
    }, {});
}
