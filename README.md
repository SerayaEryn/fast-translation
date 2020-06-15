# fast-translation

![Build Status](https://github.com/SerayaEryn/fast-translation/workflows/ci/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/SerayaEryn/fast-translation/badge.svg?branch=master)](https://coveralls.io/github/SerayaEryn/fast-translation?branch=master)
[![NPM version](https://img.shields.io/npm/v/fast-translation.svg?style=flat)](https://www.npmjs.com/package/fast-translation)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A performant module for handling translations.

## Installation

```
npm install fast-translation
```

## Example

```js
const { Translator } = require('fast-translation');

const translator = new Translator();
translator.addRule('en-US', [1, 2], (count) => count !== 1 ? 0 : 1);
translator.addTranslations({
  test: {
    key: '__count__ bird'
    key_plural_2: '__count__ birds'
  }
}, 'en-US', 'default');
await translator.initialize();
translator.translate('test.key', { language: 'en-US' }); // 1 bird
translator.translate('test.key', { language: 'en-US', count: 2 }); // 2 birds
translator.translate('test.key', { language: 'en-US', namespace: 'default' }); // 1 bird
```

## Interpolation

Interpolation allows to insert values into the translations:

```js 
translator.addTranslations({
  birds: 'a __color__ bird'
}, 'en-US', 'default');
await translator.initialize();
translator.translate('birds', { language: 'en-US', color: 'blue' }) // a blue bird
```

## Keys

There are three possible types of keys:

1. Keys representing the singular: `key`
2. Keys representing first plural: `key_plural`
3. Keys representing any plural (using the plurals specified with `addRule`): `key_plural_3`

## API

### Translator(options)

#### options

##### preloadLanguages (optional)

Array of languages to be loaded with sources.

##### preloadNamespaces (optional)

Array of namespaces to be loaded with sources.

##### reloadInterval (optional)

A `number` in milliseconds that defines the interval to reload the translations.

##### logger (optional)

If set it will log errors during reload using the provided `logger`. Needs at least an `error()` function.

#### Translator#use(source)

Adds a source for translations. There are two kind of sources being provided:
```js
const { FileSource, HttpSource } = require('fast-translation');
const httpSource = new HttpSource({
  url: `http://localhost:${port}/locales/__language__/__namespace__`
});
const fileSource = new FileSource({
  filePath: __dirname + `/locales/__language__-__namespace__.json`
});
translator.use(httpSource);
translator.use(fileSource);
```

#### Translator#initialize()

Initializes the translator. Returns a Promise.

#### Translator#translate(key, options)

Translates the provided `key` using the provided `options`. All placeholders 
will be replaced by the values provided with the options.

```js
translator.translate('a.key', { language: 'en' })
```

The process of finding a translation works as follows (assuming the key is known):
1. Determine the `count`: Either `options.count` or `1`.
2. Determine the `plural`: Call the `rule` function for the `language` with the `count`.
3. Determine the `namespace`: Either `options.namespace` or `default`.
4. Build an identifier from the `key`, `language`, `plural` and `namespace`.
5. Use the identifier to find a translation function, execute it with the `options` and return the result.

**Note**: If `translate()` is being called with an unknown key the key will be 
returned.

##### options#language

The `language` that will be used to translate the `key` will be translated to. 

##### options#namespace (optional)

The `namespace` that will be used to translate the `key`. Defaults to `default`.

##### options#count (optional)

A `number` used to determine the plural for the `key`. Defaults to `1`.

#### Translator#addRule(language, plurals, rule)

Adds a plural `rule` function for a `language` along with an array of `plurals` 
that will be used to determine the correct plural.

```js
translator.addRule('de-DE', [1, 2], (count) => count !== 1 ? 0 : 1)
```

#### Translator#addTranslations(translations, language, [namespace])

If no namespace is being passed it defaults to `default`. The translations may 
contain placeholders like `__placeholder__`.

For each key a function is being created and stored internally, that handles 
translation and interpolation for that key.

#### Translator#reload([handler])

Reloads the translations using the sources. Allows to pass a `handler` function 
that will be called if an error occurs.

## Benchmark

```bash
> node benchmark/benchmark.js

i18next x 225,728 ops/sec ±1.10% (84 runs sampled)
fast-translation x 5,130,229 ops/sec ±0.59% (90 runs sampled)
Fastest is fast-translation
```

## License

[MIT](./LICENSE)
