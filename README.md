# rework-custom-import

> Handles inlining CSS imports where dependency resolution has already been completed by another
build tool, mostly to improve source-map support.

[![npm version](https://img.shields.io/npm/v/rework-custom-import.svg)](https://www.npmjs.com/package/rework-custom-import)
[![npm dependencies](https://img.shields.io/david/dominicbarnes/rework-custom-import.svg)](https://david-dm.org/dominicbarnes/rework-custom-import)
[![npm dev dependencies](https://img.shields.io/david/dev/dominicbarnes/rework-custom-import.svg)](https://david-dm.org/dominicbarnes/rework-custom-import#info=devDependencies)
[![build status](https://img.shields.io/travis/dominicbarnes/rework-custom-import.svg)](https://travis-ci.org/dominicbarnes/rework-custom-import)

I originally built this for use with [mako-css](https://github.com/makojs/css), but I think there
might eventually be value as a general-purpose tool.

## Usage

This is a [rework](https://github.com/reworkcss/rework) plugin that is very similar to
[rework-import](https://github.com/reworkcss/rework-import). Instead of resolving the imports
directly, this module assumes the resolution has already been completed.

## API

### customImport(mapping)

The `mapping` parameter is an object that looks just like the one created by
[module-deps](https://github.com/substack/module-deps) (which is used by Browserify).

```json
{
  "index.css": {
    "id": "index.css",
    "source": "\n@import './lib';\n\n* {\n  box-sizing: border-box;\n}\n",
    "deps": {
      "./lib": "lib/index.css"
    },
    "entry": true
  },
  "lib/index.css": {
    "id": "lib/index.css",
    "source": "\nbody {\n  background-color: blue;\n}\n",
    "deps": {}
  }
}
```

When running through rework, use the entry `id` as `options.source`:

```js
var rework = require('rework');
var customImport = require('rework-custom-import');
var mapping = generateMapping(); // your external lib that generates the above JSON

let css = rework(mapping['index.css'].source, { source: 'index.css' })
  .use(customImport(mapping))
  .toString();

console.log(css);
```

**NOTE:** this module is entirely synchronous, just like any other rework plugin. Thus,
your resolution must be _finished_ before passing the CSS to rework.
