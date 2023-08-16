const JSDOMEnvironmentBase = require('jest-environment-jsdom');

Object.defineProperty(exports, '__esModule', {
  value: true,
});

class JSDOMEnvironment extends JSDOMEnvironmentBase {
  constructor(...args) {
    const { global } = super(...args);

    global.Uint8Array = Uint8Array;
  }
}

exports.default = JSDOMEnvironment;
exports.TestEnvironment = JSDOMEnvironment;
