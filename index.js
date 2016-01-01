
'use strict';

let assert = require('assert');
let css = require('css');
let debug = require('debug')('rework-custom-import');
let parse = require('parse-import');

module.exports = function (mapping) {
  debug('initialize');
  assert(mapping, 'you must supply a precomputed mapping');

  return function run(style) {
    let source = getSource(style);
    let meta = mapping[source];
    let rules = [];
    debug('running on %s', source);

    style.rules.forEach(function (rule) {
      if (rule.type !== 'import') {
        rules.push(rule);
        return;
      }

      debug('importing %s', rule.import);
      let data = parse(`@import ${rule.import};`).shift();
      let dep = mapping[meta.deps[data.path]];
      let content = css.parse(dep.source, { source: dep.id }).stylesheet;
      run(content);

      if (data.condition && data.condition.length) {
        debug('import condition: %j', data.condition);
        rules.push({
          media: data.condition,
          rules: content.rules,
          type: 'media'
        });
      } else {
        rules.push.apply(rules, content.rules);
      }
    });

    style.rules = rules;
  };
};

function getSource(style) {
  if (style.rules.length === 0) return null;
  return style.rules[0].position.source;
}
