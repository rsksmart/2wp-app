const preset = require('@vue/cli-plugin-unit-jest/presets/typescript-and-babel/jest-preset');

// Remove deprecated ts-jest from globals
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { 'ts-jest': _, ...globalsWithoutTsJest } = preset.globals || {};

module.exports = {
  ...preset,
  transform: {
    ...preset.transform,
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(mts|ts|tsx)$': ['ts-jest', {
      babelConfig: true, // Moved from deprecated globals config
    }],
    '^.+\\.mjs$': 'babel-jest',
  },
  globals: globalsWithoutTsJest,
  collectCoverage: true,
  collectCoverageFrom: ['src/(common|pegin)/(providers|services|utils)/*.ts'],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 10,
      lines: 20,
      statements: 20,
    },
  },
  coverageProvider: 'v8',
  transformIgnorePatterns: [
    'node_modules/(?!axios|sats-connect|@sats-connect)',
  ],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
  silent: true,
  testPathIgnorePatterns: ['.*Builder.spec.ts'], // TODO: Remove once resolved @reown/appkit/vue import issue
};
