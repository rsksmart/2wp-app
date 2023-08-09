module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-shadow': 'warn',
    '@typescript-eslint/no-shadow': ['warn'],
    camelcase: 'error',
    'no-use-before-define': 'error',
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'import/no-cycle': 'off',
    'max-len': ['warn', { code: 100, ignoreComments: true, ignoreTemplateLiterals: true }],
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
