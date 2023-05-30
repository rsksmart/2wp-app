module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
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
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests2/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        mocha: true,
      },
    },
  ],
};
