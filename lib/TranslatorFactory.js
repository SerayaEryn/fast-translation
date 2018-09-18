'use strict'

const generateFunction = require('generate-function')
const generateObjectProperty = require('generate-object-property')

function build (translation) {
  let templateString = translation
  try {
    const regex = /__(\w+)__/g
    let match
    while ((match = regex.exec(templateString))) {
      const parameter = match[1]
      const property = generateObjectProperty('options', parameter)
      templateString = templateString.replace(`__${parameter}__`, `\${${property}}`)
    }
    const gen = generateFunction()
    gen('function translator (options) {')
    gen(`return \`${templateString}\``)
    gen('}')
    return gen.toFunction()
  } catch (error) {
    const detailedError = new Error('Failed to build translator function for "' + translation + '"')
    detailedError.stack += '\nCaused by:\n'
    detailedError.stack += error.stack
    throw detailedError
  }
}

module.exports = {
  build
}
