const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');
const { defineConfig } = require('@vue/cli-service');
const { VuetifyPlugin } = require('webpack-plugin-vuetify');

module.exports = defineConfig({
  pwa: {
    name: 'PowPeg',
    themeColor: '#FF9800',
    iconPaths: {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
    },
    manifestOptions: {
      id: 'powpeg',
      short_name: 'PowPeg',
      description: 'Bridging Bitcoin and Rootstock',
      start_url: '/',
      display: 'standalone',
      icons: [
        {
          purpose: 'any maskable',
          sizes: '1024x1024',
          src: 'img/icons/maskable_icon.png',
          type: 'image/png',
        },
        {
          purpose: 'maskable',
          sizes: '192x192',
          src: 'img/icons/maskable_icon_x192.png',
          type: 'image/png',
        },
        {
          purpose: 'maskable',
          sizes: '384x384',
          src: 'img/icons/maskable_icon_x384.png',
          type: 'image/png',
        },
        {
          purpose: 'maskable',
          sizes: '512x512',
          src: 'img/icons/maskable_icon_x512.png',
          type: 'image/png',
        },
      ],
    },
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
    },
  },
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
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
      new VuetifyPlugin({ styles: { configFile: 'src/scss/settings.scss' } }),
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
