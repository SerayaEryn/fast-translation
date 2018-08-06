'use strict';

function build(translation) {
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
}

module.exports = {
  build
};
