'use strict'

const tap = require('tap')
const test = tap.test
const Translation = require('../lib/Translator')
const FileSource = require('../lib/sources/FileSource')
const path = require('path')

test('should laod translation from file', (t) => {
  t.plan(5)

  const translation = new Translation({
    preloadLanguages: ['de'],
    preloadNamespaces: ['DE']
  })
  return translation
    .addRule('de', [1, 2], function (number) {
      return number === 1 ? 0 : 1
    })
    .use(new FileSource({
      filePath: path.join(__dirname, `/locales/__language_____namespace__.json`)
    }))
    .initialize()
    .then(() => {
      t.strictEquals(translation.translate('unknown.key', {
        language: 'de',
        namespace: 'DE'
      }), 'unknown.key')
      t.strictEquals(translation.translate('test.title', {
        language: 'de',
        namespace: 'DE'
      }), 'undefined singular')
      t.strictEquals(translation.translate('test.title', {
        count: 1,
        language: 'de',
        namespace: 'DE'
      }), '1 singular')
      t.strictEquals(translation.translate('test.title', {
        count: 2,
        language: 'de',
        namespace: 'DE'
      }), '2 plural')
      t.strictEquals(translation.translate('test.title', {
        count: 0,
        language: 'de',
        namespace: 'DE'
      }), '0 plural')
    })
})

test('Should reject on missing file', (t) => {
  t.plan(1)

  const translation = new Translation({
    preloadLanguages: ['at'],
    preloadNamespaces: ['DE']
  })
  return translation
    .addRule('de', [1, 2], function (number) {
      return number === 1 ? 0 : 1
    })
    .use(new FileSource({
      filePath: path.join(__dirname, `/locales/__language_____namespace__.json`)
    }))
    .initialize()
    .catch((err) => {
      t.ok(err)
    })
})

test('Should reject on invalid json file', (t) => {
  t.plan(1)

  const translation = new Translation({
    preloadLanguages: ['de'],
    preloadNamespaces: ['CH']
  })
  return translation
    .addRule('de', [1, 2], function (number) {
      return number === 1 ? 0 : 1
    })
    .use(new FileSource({
      filePath: path.join(__dirname, `/locales/__language_____namespace__.json`)
    }))
    .initialize()
    .catch((err) => {
      t.ok(err)
    })
})
