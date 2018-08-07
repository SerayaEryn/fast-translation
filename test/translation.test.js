'use strict';

const tap = require('tap');
const test = tap.test;
const Translation = require('../lib/Translator');

test('', (t) => {
  t.plan(6);
  const translations = {
    'test.title': 'singular',
    'test.title_plural_2': 'plural',
    'test.name_plural': 'another plural'
  };

  const translation = new Translation();

  translation.addRule('de', [1, 2], function (number) {
    return number === 1 ? 0 : 1;
  });

  translation.addTranslations(translations, 'de', 'DE');

  t.strictEquals(translation.translate('unknown.key', {
    language: 'de',
    namespace: 'DE'
  }), 'unknown.key');
  t.strictEquals(translation.translate('test.title', {
    language: 'de',
    namespace: 'DE'
  }), 'singular');
  t.strictEquals(translation.translate('test.title', {
    count: 1,
    language: 'de',
    namespace: 'DE'
  }), 'singular');
  t.strictEquals(translation.translate('test.title', {
    count: 2,
    language: 'de',
    namespace: 'DE'
  }), 'plural');
  t.strictEquals(translation.translate('test.title', {
    count: 0,
    language: 'de',
    namespace: 'DE'
  }), 'plural');
  t.strictEquals(translation.translate('test.name', {
    count: 2,
    language: 'de',
    namespace: 'DE'
  }), 'another plural');
});

test('should use default namespace', (t) => {
  t.plan(6);
  const translations = {
    'test.title': 'singular',
    'test.title_plural_2': 'plural',
    'test.name_plural': 'another plural'
  };

  const translation = new Translation();

  translation.addRule('de', [1, 2], function (number) {
    return number === 1 ? 0 : 1;
  });

  translation.addTranslations(translations, 'de');

  t.strictEquals(translation.translate('unknown.key', {
    language: 'de'
  }), 'unknown.key');
  t.strictEquals(translation.translate('test.title', {
    language: 'de'
  }), 'singular');
  t.strictEquals(translation.translate('test.title', {
    count: 1,
    language: 'de'
  }), 'singular');
  t.strictEquals(translation.translate('test.title', {
    count: 2,
    language: 'de'
  }), 'plural');
  t.strictEquals(translation.translate('test.title', {
    count: 0,
    language: 'de'
  }), 'plural');
  t.strictEquals(translation.translate('test.name', {
    count: 2,
    language: 'de'
  }), 'another plural');
});

test('', (t) => {
  t.plan(5);
  const translations = {
    'test.title': '__count__ singular',
    'test.title_plural_2': '__count__ plural'
  };

  const translation = new Translation();

  translation.addRule('de', [1, 2], function (number) {
    return number === 1 ? 0 : 1;
  });

  translation.addTranslations(translations, 'de', 'DE');

  t.strictEquals(translation.translate('unknown.key', {
    language: 'de',
    namespace: 'DE'
  }), 'unknown.key');
  t.strictEquals(translation.translate('test.title', {
    language: 'de',
    namespace: 'DE'
  }), 'undefined singular');
  t.strictEquals(translation.translate('test.title', {
    count: 1,
    language: 'de',
    namespace: 'DE'
  }), '1 singular');
  t.strictEquals(translation.translate('test.title', {
    count: 2,
    language: 'de',
    namespace: 'DE'
  }), '2 plural');
  t.strictEquals(translation.translate('test.title', {
    count: 0,
    language: 'de',
    namespace: 'DE'
  }), '0 plural');
});

test('should use source', (t) => {
  t.plan(5);
  const translations = {
    test: {
      title: '__count__ singular',
      title_plural_2: '__count__ plural'
    }
  };

  class TestSource {
    load() {
      return Promise.resolve([{
        language: 'de',
        namespace: 'DE',
        translations
      }]);
    }
  }

  const translation = new Translation({
    preload: ['de']
  });
  translation
    .addRule('de', [1, 2], function (number) {
      return number === 1 ? 0 : 1;
    })
    .use(new TestSource())
    .initialize()
    .then(() => {
      t.strictEquals(translation.translate('unknown.key', {
        language: 'de',
        namespace: 'DE'
      }), 'unknown.key');
      t.strictEquals(translation.translate('test.title', {
        language: 'de',
        namespace: 'DE'
      }), 'undefined singular');
      t.strictEquals(translation.translate('test.title', {
        count: 1,
        language: 'de',
        namespace: 'DE'
      }), '1 singular');
      t.strictEquals(translation.translate('test.title', {
        count: 2,
        language: 'de',
        namespace: 'DE'
      }), '2 plural');
      t.strictEquals(translation.translate('test.title', {
        count: 0,
        language: 'de',
        namespace: 'DE'
      }), '0 plural');
    });
});
