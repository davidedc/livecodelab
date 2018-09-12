module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    indent: [2, 2, { SwitchCase: 1, VariableDeclarator: 1 }],
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'always'],
  },
};
