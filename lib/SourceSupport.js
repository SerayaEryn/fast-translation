'use strict';

const flat = require('array.prototype.flat');

function load(sources, languages, namespaces = ['default']) {
  const promises = sources.map((source) => source.load(languages, namespaces));
  return Promise.all(promises)
    .then((translationsFromBackends) => {
      const flatendTranslations = flat(translationsFromBackends);
      return flatendTranslations.map(transform);
    });
}

function transform(translations) {
  const flatTranslations = {}
  flattenTranslations(null, translations.translations, flatTranslations);
  translations.translations = flatTranslations;
  return translations;
}

function flattenTranslations(baseKey, object, map) {
  if (typeof object === 'string') {
    map[baseKey] = object;
  } else {
    for (const key of Object.keys(object)) {
      flattenTranslations(getKey(baseKey, key), object[key], map);
    }
  }
}

function getKey(baseKey, key) {
  if (!baseKey)
    return key;
  return baseKey + '.' + key;
}

module.exports = {
  load
};
