'use strict';

const fs = require('fs');

module.exports = class FileSource {
  constructor(options) {
    this.options = options;
  }

  load(languages, namespaces) {
    const filePath = this.options.filePath;
    const promises = [];
    for (const language of languages) {
      for (const namespace of namespaces) {
        const path = filePath.replace(/__(language)__/g, language)
          .replace(/__(namespace)__/g, namespace);
        promises.push(new Promise((resolve, reject) => {
          fs.readFile(path, function (err, data) {
            if (err) {
              reject(err);
            } else {
              try {
                const translations = JSON.parse(data.toString());
                resolve({language, namespace, translations});
              } catch (err) {
                return reject(err);
              }
            }
          });
        }));
      }
    }
    return Promise.all(promises);
  }
};
