'use strict'

const sourceSupport = require('./SourceSupport')
const translatorFactory = require('./TranslatorFactory')
const { getOptions } = require('./DefaultOptions')

module.exports = class Translator {
  constructor (options) {
    this.translators = {}
    this.rules = {}
    this.plurals = {}
    this.sources = []
    this.options = getOptions(options)
    this.interval = null
  }

  use (source) {
    this.sources.push(source)
    return this
  }

  initialize () {
    const { preloadLanguages, preloadNamespaces, reloadInterval } = this.options
    if (reloadInterval) {
      this.interval = setInterval(() => {
        this.reload((error) => {
          if (this.options.logger && error) {
            this.options.logger.error(`Failed to reload translations because of: ${error.message}`)
          }
        })
      }, reloadInterval)
    }
    return sourceSupport.load(this.sources, preloadLanguages, preloadNamespaces)
      .then((arrayOfTranslations) => postSourceLoad.call(this, arrayOfTranslations))
  }

  reload (handler) {
    return this._reload()
      .then(() => {
        if (handler) handler(null)
      })
      .catch((error) => {
        if (handler) handler(error)
      })
  }

  addTranslations (translations, language, namespace = 'default') {
    for (const key of Object.keys(translations)) {
      addTranslation.call(this, namespace, language, key, translations[key])
    }
  }

  translate (key, options) {
    const translator = this._getTranslator(options, key)
    if (translator) {
      return translator(options)
    }
    return key
  }

  addRule (language, plurals, rule) {
    this.rules[language] = rule
    this.plurals[language] = plurals
    return this
  }

  _reload () {
    const { preloadLanguages, preloadNamespaces } = this.options
    return sourceSupport.load(this.sources, preloadLanguages, preloadNamespaces)
      .then((arrayOfTranslations) => postSourceLoad.call(this, arrayOfTranslations))
  }

  _getTranslator (options, key) {
    const number = this._getPlural(options)
    const { language } = options
    const namespace = options.namespace || 'default'
    const enrichedKey = `${namespace}${language}${key}_plural_${number}`
    return this.translators[enrichedKey]
  }

  _getPlural (options) {
    const count = options.count === undefined ? 1 : options.count
    const rule = this.rules[options.language]
    return this.plurals[options.language][rule(count)]
  }
}

function addTranslation (namespace, language, key, value) {
  const translator = translatorFactory.build(value)
  const finalKey = buildKey.call(this, namespace, language, key)
  this.translators[finalKey] = translator
}

function postSourceLoad (arrayOfTranslations) {
  return arrayOfTranslations.map((translationsByNamespaceAndLanguage) => {
    const { language, namespace, translations } = translationsByNamespaceAndLanguage
    this.addTranslations(translations, language, namespace)
  })
}

function buildKey (namespace, language, key) {
  if (key.includes('_plural')) {
    if (key.endsWith('_plural')) {
      const plural = this.plurals[language][1]
      return `${namespace}${language}${key}_${plural}`
    } else {
      return `${namespace}${language}${key}`
    }
  } else {
    const plural = this.plurals[language][0]
    return `${namespace}${language}${key}_plural_${plural}`
  }
}
