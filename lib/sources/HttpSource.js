'use strict';

const simpleGet = require('simple-get');

module.exports = class HttpSource {
  constructor(options) {
    this.options = options;
  }

  load(languages, namespaces) {
    const url = this.options.url;
    const promises = [];
    for (const language of languages) {
      for (const namespace of namespaces) {
        const path = url.replace(/__(language)__/g, language)
          .replace(/__(namespace)__/g, namespace);
        promises.push(getTranslations(path, namespace, language));
      }
    }
    return Promise.all(promises);
  }
};

function getTranslations(path, namespace, language) {
  return new Promise((resolve, reject) => {
    simpleGet.concat(path, (err, res, data) => {
      if (err) {
        reject(err);
      } else if (res.statusCode >= 400) {
        reject(new Error(`http statusCode=${res.statusCode} ` +
          `for namespace=${namespace} and language=${language}`));
      } else {
        try {
          const translations = JSON.parse(data.toString());
          resolve({language, namespace, translations});
        } catch (err) {
          return reject(err);
        }
      }
    });
  })
}
