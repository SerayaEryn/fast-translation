'use strict'

const tap = require('tap')
const test = tap.test
const Translation = require('../lib/Translator')

test('', (t) => {
  t.plan(6)
  const translations = {
    'test.title': 'singular',
    'test.title_plural_2': 'plural',
    'test.name_plural': 'another plural'
  }

  const translation = new Translation()

  translation.addRule('de', [1, 2], function (number) {
    return number === 1 ? 0 : 1
  })

  translation.addTranslations(translations, 'de', 'DE')

  t.strictEquals(translation.translate('unknown.key', {
    language: 'de',
    namespace: 'DE'
  }), 'unknown.key')
  t.strictEquals(translation.translate('test.title', {
    language: 'de',
    namespace: 'DE'
  }), 'singular')
  t.strictEquals(translation.translate('test.title', {
    count: 1,
    language: 'de',
    namespace: 'DE'
  }), 'singular')
  t.strictEquals(translation.translate('test.title', {
    count: 2,
    language: 'de',
    namespace: 'DE'
  }), 'plural')
  t.strictEquals(translation.translate('test.title', {
    count: 0,
    language: 'de',
    namespace: 'DE'
  }), 'plural')
  t.strictEquals(translation.translate('test.name', {
    count: 2,
    language: 'de',
    namespace: 'DE'
  }), 'another plural')
})

test('support keys with underscore', (t) => {
  t.plan(2)
  const translations = {
    'test.title_new': 'singular',
    'test.title_new_plural_2': 'plural'
  }

  const translation = new Translation()

  translation.addRule('de', [1, 2], function (number) {
    return number === 1 ? 0 : 1
  })

  translation.addTranslations(translations, 'de', 'DE')

  t.strictEquals(translation.translate('test.title_new', {
    language: 'de',
    namespace: 'DE'
  }), 'singular')
  t.strictEquals(translation.translate('test.title_new', {
    count: 2,
    language: 'de',
    namespace: 'DE'
  }), 'plural')
})

test('should support numeric placeholders', (t) => {
  t.plan(2)
  const translations = {
    'test.cat': '__0__ cat',
    'test.cat_plural_2': '__0__ cats'
  }

  const translation = new Translation()

  translation.addRule('de', [1, 2], function (number) {
    return number === 1 ? 0 : 1
  })

  translation.addTranslations(translations, 'de', 'DE')

  t.strictEquals(translation.translate('test.cat', {
    language: 'de',
    namespace: 'DE',
    count: 1,
    0: 1
  }), '1 cat')
  t.strictEquals(translation.translate('test.cat', {
    count: 2,
    language: 'de',
    namespace: 'DE',
    0: 2
  }), '2 cats')
})

test('should use default namespace', (t) => {
  t.plan(6)
  const translations = {
    'test.title': 'singular',
    'test.title_plural_2': 'plural',
    'test.name_plural': 'another plural'
  }

  const translation = new Translation()

  translation.addRule('de', [1, 2], function (number) {
    return number === 1 ? 0 : 1
  })

  translation.addTranslations(translations, 'de')

  t.strictEquals(translation.translate('unknown.key', {
    language: 'de'
  }), 'unknown.key')
  t.strictEquals(translation.translate('test.title', {
    language: 'de'
  }), 'singular')
  t.strictEquals(translation.translate('test.title', {
    count: 1,
    language: 'de'
  }), 'singular')
  t.strictEquals(translation.translate('test.title', {
    count: 2,
    language: 'de'
  }), 'plural')
  t.strictEquals(translation.translate('test.title', {
    count: 0,
    language: 'de'
  }), 'plural')
  t.strictEquals(translation.translate('test.name', {
    count: 2,
    language: 'de'
  }), 'another plural')
})

test('should handle interpolation', (t) => {
  t.plan(5)
  const translations = {
    'test.title': '__count__ singular',
    'test.title_plural_2': '__count__ plural'
  }

  const translation = new Translation()

  translation.addRule('de', [1, 2], function (number) {
    return number === 1 ? 0 : 1
  })

  translation.addTranslations(translations, 'de', 'DE')

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

test('should throw error on invalid translation', (t) => {
  t.plan(2)
  const translations = {
    'test.title': '__${}__ singular',
    'test.title_plural_2': '__count__ plural'
  }

  const translation = new Translation()

  translation.addRule('de', [1, 2], function (number) {
    return number === 1 ? 0 : 1
  })

  try {
    translation.addTranslations(translations, 'de', 'DE')
  } catch (error) {
    t.ok(error)
    t.ok(error.message.includes('Failed to build translator function'))
  }
})

test('should handle reload', (t) => {
  t.plan(2)
  const translation = new Translation({
    reloadInterval: 50,
    preloadLanguages: ['de']
  })

  translation.addRule('de', [1, 2], function (number) {
    return number === 1 ? 0 : 1
  })
  const _reload = translation._reload.bind(translation)
  translation._reload = () => {
    t.pass()
    return _reload()
  }

  return translation.initialize()
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          clearInterval(translation.interval)
          t.pass()
          resolve()
        }, 75)
      })
    })
})

test('should use source', (t) => {
  t.plan(5)
  const translations = {
    test: {
      title: '__count__ singular',
      title_plural_2: '__count__ plural'
    }
  }

  class TestSource {
    load () {
      return Promise.resolve([{
        language: 'de',
        namespace: 'DE',
        translations
      }])
    }
  }

  const translation = new Translation({
    preload: ['de']
  })
  translation
    .addRule('de', [1, 2], function (number) {
      return number === 1 ? 0 : 1
    })
    .use(new TestSource())
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

test('should use handler on reload()', (t) => {
  t.plan(4)
  class TestSource {
    load () {
      return Promise.reject(new Error('booom'))
    }
  }

  const translation = new Translation({
    preload: ['de']
  })
  return translation
    .use(new TestSource())
    .initialize()
    .catch((error) => {
      t.ok(error)
      t.strictEquals(error.message, 'booom')
    })
    .then(() => {
      return new Promise((resolve) => {
        translation.reload((error) => {
          t.ok(error)
          t.strictEquals(error.message, 'booom')
          resolve()
        })
      })
    })
})

