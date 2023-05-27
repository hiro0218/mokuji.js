module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:unicorn/recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['unicorn', '@typescript-eslint'],
  ignorePatterns: ['node_modules', 'dist', '.eslintrc.js'],
  rules: {
    'unicorn/consistent-destructuring': 'off',
    'unicorn/no-for-loop': 'off',
    'unicorn/prevent-abbreviations': 'off',
  },
};