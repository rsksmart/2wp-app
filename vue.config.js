const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');
const { defineConfig } = require('@vue/cli-service');
const { VuetifyPlugin } = require('webpack-plugin-vuetify');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const sentryUploadEnabled = isProduction
  && !!process.env.SENTRY_ORG
  && !!process.env.SENTRY_PROJECT
  && !!process.env.SENTRY_AUTH_TOKEN;

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => ({
        ...options,
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('appkit-'),
        },
      }));
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // Trezor Connect is a singleton: it installs a window "message" listener and issues
        // sequential request ids starting at 1. Two copies on the page cross-resolve each
        // other's postMessage responses, so every consumer must share this one.
        '@trezor/connect-web': path.resolve(__dirname, 'node_modules/@trezor/connect-web'),
      },
      extensions: ['.png'],
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        url: require.resolve('url/'),
        os: require.resolve('os-browserify/browser'),
        https: require.resolve('https-browserify'),
        http: require.resolve('stream-http'),
        vm: false,
      },
    },
    devtool: isProduction ? 'hidden-source-map' : 'eval-cheap-module-source-map',
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
      new VuetifyPlugin({ styles: { configFile: 'src/scss/settings.scss' } }),
      ...(sentryUploadEnabled ? [sentryWebpackPlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          filesToDeleteAfterUpload: ['dist/**/*.map'],
        },
      })] : []),
    ],
  },
  devServer: {
    server: {
      type: 'https',
    },
    // Mirrors the header nginx.conf serves in production so the popup-based wallet flows
    // are exercised under the same opener policy during development.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true,
    },
  },
});
