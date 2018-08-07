'use strict';

const Benchmark = require('benchmark');
const Translator = require('../lib/FastTranslation').Translator;
const i18next = require('i18next')

i18next.init({
  ns: 'default',
  defaultNS: 'default',
  initImmediate: false
})
i18next.addResourceBundle('de', 'default', {
  test: {
    title: '{{count}} singular',
    title_plural: '{{count}} plural'
  }
}, true, true);

const translations = {
  'test.title': 'singular',
  'test.title_plural_2': 'plural'
};

const translation = new Translator();

translation.addRule('de', [1, 2], function (number) {
  return number === 1 ? 0 : 1;
});

translation.addTranslations(translations, 'de', 'DE');
var suite = new Benchmark.Suite();
suite
  .add('i18next', () => {
    return i18next.t('test.title', {
      lng: 'de',
      count: 1
    });
  })
  .add('fast-translation', () => {
    return translation.translate('test.title', {
      count: 1,
      language: 'de',
      namespace: 'DE'
    });
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });
