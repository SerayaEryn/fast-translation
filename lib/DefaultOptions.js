'use strict'

function getOptions (options = {}) {
  return Object.assign({
    preloadLanguages: [],
    preloadNamespaces: ['default'],
    reloadInterval: null
  }, options)
}

module.exports = {
  getOptions
}
