import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import unicorn from 'eslint-plugin-unicorn';

export default [
  {
    ignores: ['node_modules', 'dist', 'tsup.config.ts'],
  },
  {
    // すべてのファイルに対する設定
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: {
        browser: true,
        es2021: true,
        node: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      unicorn: unicorn,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...unicorn.configs.recommended.rules,
      'unicorn/consistent-destructuring': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-for-loop': 'off',
      'unicorn/prefer-export-from': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },
];
