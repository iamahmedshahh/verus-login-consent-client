import pluginJs from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';
import prettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}']},
  {
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    rules: {
      indent: ['warn', 2, {SwitchCase: 1}],
      semi: ['warn', 'always'],
      '@stylistic/js/no-trailing-spaces': 'error',
      '@stylistic/js/object-curly-spacing': ['warn', 'never'],
    },
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    name: 'plugin/prettier',
    ...prettier,
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  ...tseslint.configs.recommended,
];
