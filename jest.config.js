module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
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
  transformIgnorePatterns: ['node_modules/(?!axios)/'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
};
