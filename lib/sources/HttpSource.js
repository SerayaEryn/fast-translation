'use strict';

const simpleGet = require('simple-get');
const fs = require('fs');

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
        promises.push(new Promise((resolve, reject) => {
          simpleGet.concat(path, (err, res, data) => {
            if (err) {
              reject(err);
            } else if (res.statusCode >= 400) {
              reject(new Error());
            } else {
              try {
                const translations = JSON.parse(data.toString());
                fs.writeFile(this.options.filePath, data, {encoding: 'utf-8'}, (err) => {
                  if (err) return reject(err);
                  resolve({language, namespace, translations});
                });
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
