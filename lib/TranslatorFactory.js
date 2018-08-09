'use strict';

function build(translation) {
  let templateString = translation;
  try {
    const regex = /__(\w+)__/g;
    const parameters = []; 
    let match;
    while ((match = regex.exec(templateString))) {
      const parameter = match[1];
      parameters.push(parameter);
      templateString = templateString.replace(`__${parameter}__`, `\${options['${parameter}']}`);
    }
    const translator = `return \`${templateString}\``;
    return new Function('options', translator);
  } catch (error) {
    const detailedError = new Error('Failed to build translator function for "' + translation + '"');
    detailedError.stack += '\nCaused by:\n'
    detailedError.stack += error.stack;
    throw detailedError;
  }
}

module.exports = {
  build
};
