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
