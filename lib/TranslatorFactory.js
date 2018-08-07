'use strict';

function build(translation) {
  try {
    const regex = /__(\w+)__/g;
    const parameters = []; 
    let match;
    while ((match = regex.exec(translation))) {
      const parameter = match[1];
      parameters.push(parameter);
      translation = translation.replace(`__${parameter}__`, `\${options.${parameter}}`);
    }
    const translator = `return \`${translation}\``;
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
