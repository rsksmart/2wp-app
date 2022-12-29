module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,vue}'],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 10,
      lines: 20,
      statements: 20,
    },
  },
};
