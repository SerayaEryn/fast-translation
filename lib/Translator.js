'use strict';

const sourceSupport = require('./SourceSupport');
const translatorFactory = require('./TranslatorFactory');
const { getOptions } = require('./DefaultOptions');

module.exports = class Translator {
  constructor(options) {
    this.translators = {};
    this.rules = {};
    this.numbers = {};
    this.sources = [];
    this.options = getOptions(options);
  }

  use(source) {
    this.sources.push(source);
    return this;
  }

  initialize() {
    const { preloadLanguages, preloadNamespaces, reloadInterval } = this.options;
    if (reloadInterval) 
      setInterval(() => {this.reload()}, reloadInterval);
    return sourceSupport.load(this.sources, preloadLanguages, preloadNamespaces)
      .then((arrayOfTranslations) => this._postBackendLoad(arrayOfTranslations));
  }

  reload() {
    return this.initialize();
  }

  addTranslations(translations, language, namespace = 'default') {
    for (const key of Object.keys(translations)) {
      this._addTranslation(namespace, language, key, translations[key]);
    }
  }

  translate(key, options) {
    const translator = this._getTranslator(options, key);
    if (translator)
      return translator(options);
    return key;
  }

  addRule(language, numbers, rule) {
    this.rules[language] = rule;
    this.numbers[language] = numbers;
    return this;
  }

  _postBackendLoad(arrayOfTranslations) {
    return arrayOfTranslations.map((translationsByNamespaceAndLanguage) => {
      const { language, namespace, translations } = translationsByNamespaceAndLanguage;
      this.addTranslations(translations, language, namespace);
    });
  }

  _getTranslator(options, key) {
    const number = this._getPlural(options);
    const enrichedKey = `${options.namespace || 'default'}${options.language}${key}_plural_${number}`;
    return this.translators[enrichedKey];
  }

  _getPlural(options) {
    const count = options.count === undefined ? 1 : options.count;
    const rule = this.rules[options.language];
    return this.numbers[options.language][rule(count)];
  }

  _addTranslation(namespace, language, key, value) {
    const translator = translatorFactory.build(value);
    const finalKey = this._buildKey(namespace, language, key);
    this.translators[finalKey] = translator;
  }

  _buildKey(namespace, language, key) {
    if (key.includes('_')) {
      if (key.endsWith('_plural')) {
        const number = this.numbers[language][1];
        return `${namespace}${language}${key}_${number}`;
      } else {
        return `${namespace}${language}${key}`;
      }
    } else {
      const number = this.numbers[language][0];
      return `${namespace}${language}${key}_plural_${number}`;
    }
  }
}