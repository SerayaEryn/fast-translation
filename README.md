# fast-translation

[![Build Status](https://travis-ci.org/SerayaEryn/fast-translation.svg?branch=master)](https://travis-ci.org/SerayaEryn/fast-translation)
[![Coverage Status](https://coveralls.io/repos/github/SerayaEryn/fast-translation/badge.svg?branch=master)](https://coveralls.io/github/SerayaEryn/fast-translation?branch=master)
[![NPM version](https://img.shields.io/npm/v/fast-translation.svg?style=flat)](https://www.npmjs.com/package/fast-translation) [![Greenkeeper badge](https://badges.greenkeeper.io/SerayaEryn/fast-translation.svg)](https://greenkeeper.io/)

A performant and simple module for handling translations.

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
    key_plural1: '__count__ birds'
  }
});
await translator.init();
translator.translate('test.key', {language: 'en-US'}); // 1 bird
translator.translate('test.key', {language: 'en-US', count: 2}); // 2 birds
```

## API

### Translator(options)

#### options

##### preloadLanguages (optional)

Array of languages to be loaded with sources.

##### preloadNamespaces (optional)

Array of namespaces to be loaded with sources.

##### reloadInterval (optional)

A `number` in milliseconds that defines the interval to reload the translations.

#### Translator#use(source)

Adds a source for translations. There are two kinds  of sources being provided:
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

Translates the provided `key` using the provided `options`. All placeholders will be replaced by the values provided with the options.

```js
translator.translate('a.key', {language: 'en'})
```

##### options#language

The `language` that will be used to translate the `key` will be translated to. 

##### options#namespace (optional)

The `namespace` that will be used to translate the `key`. Defaults to `default`.

##### options#count (optional)

A `number` used to determine the plural for the `key`.

#### Translator#addRule(language, numbers, rule)

Adds a plural rule for a `language` along with an array of numbers that will be used to determine the correct plural.

```js
translator.addRule('de-DE', [1, 2], (count) => count !== 1 ? 0 : 1)
```

#### Translator#addTranslations(translations, language, [namespace])

If no namespace is being passed it defaults to `default`. The translations may contain placeholders like `__placeholder__`.

#### Translator#reload([handler])

Reloads the translations using the sources. Allows to pass a `handler` function that will be called if an error occurs.

## Benchmark

```bash
> node benchmark/benchmark.js

i18next x 226,304 ops/sec ±2.35% (87 runs sampled)
fast-translation x 5,419,834 ops/sec ±1.98% (87 runs sampled)
Fastest is fast-translation
```

## License

[MIT](./LICENSE)
