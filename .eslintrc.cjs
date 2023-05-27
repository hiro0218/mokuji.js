module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:unicorn/recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['unicorn', '@typescript-eslint'],
  ignorePatterns: ['node_modules', 'dist', '.eslintrc.js', 'tsup.config.ts'],
  rules: {
    'unicorn/consistent-destructuring': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/no-for-loop': 'off',
    'unicorn/prefer-export-from': 'off',
    'unicorn/prevent-abbreviations': 'off',
  },
};
