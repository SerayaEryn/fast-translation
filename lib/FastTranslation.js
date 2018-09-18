'use strict'

const Translator = require('./Translator')
const FileSource = require('./sources/FileSource')
const HttpSource = require('./sources/HttpSource')

module.exports = {
  Translator,
  FileSource,
  HttpSource
}
