module.exports = {
  'check-coverage': false,
  'per-file': true,
  'skip-full': true,
  all: true,
  include: [
    'src/**/*.{ts,vue}',
  ],
  exclude: [
    'src/*.js',
    '**/index.js',
  ],
  reporter: [
    'lcov',
    'text',
    'text-summary',
  ],
  extension: [
    '.ts',
    '.vue',
  ],
};
