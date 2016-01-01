
'use strict';

let assert = require('assert');
let css = require('css');
let flatten = require('array-flatten');
let parse = require('parse-import');

module.exports = function (mapping) {
  assert(mapping, 'you must supply a precomputed mapping');
  assert(typeof mapping === 'object', 'you must supply a precomputed mapping');

  return function run(style) {
    let rules = style.rules;
    let source = rules[0].position.source;
    let meta = mapping[source];

    rules.forEach(function (rule, x) {
      if (rule.type !== 'import') return;

      let data = parse(`@import ${rule.import};`).shift();
      let dep = mapping[meta.deps[data.path]];
      let content = css.parse(dep.source, { source: dep.id }).stylesheet;
      run(content);

      if (data.condition && data.condition.length) {
        rules.splice(x, 1, {
          media: data.condition,
          rules: content.rules,
          type: 'media'
        });
      } else {
        rules.splice.apply(rules, flatten([ x, 1, content.rules ]));
      }
    });
  };
};
