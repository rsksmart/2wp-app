import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import 'vuetify/styles';
import crypto from 'crypto';

export const vuetifyNonce = crypto.randomBytes(8).toString('hex');

const ROOTSTOCK_COLORS = {
  pink: '#FF70E0',
  purple: '#9E75FF',
  orange: '#FF9100',
  teal: '#08FFD1',
  yellow: '#DEFF19',
  green: '#74BD01',
  'bw-800': '#252525',
  'bw-700': '#3A3A3A',
  'bw-600': '#454545',
  'bw-500': '#898989',
  'bw-400': '#B8B8B8',
  'off-white': '#FAF9F5',
};

export const vuetify = createVuetify({
  components,
  directives,
  aliases: {
    VBtnRsk: components.VBtn,
    VBtnSquare: components.VBtn,
  },
  defaults: {
    VBtnSquare: {
      rounded: true,
      block: true,
      variant: 'outlined',
      class: 'v-btn--square',
    },
    VBtnRsk: {
      rounded: true,
      variant: 'outlined',
      class: 'v-btn--rsk',
    },
    VBtn: {
      rounded: true,
      variant: 'outlined',
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          ...ROOTSTOCK_COLORS,
          background: '#000',
          surface: '#252525',
          'theme-primary': '#9E76FF',
          alert: '#FF9100',
        },
        variables: {
          'theme-on-purple': '#000',
          'theme-on-green': '#000',
          'theme-on-pink': '#000',
        },
      },
      light: {
        colors: {
          ...ROOTSTOCK_COLORS,
          background: '#FAF9F5',
          surface: '#FAF9F5',
          'theme-primary': '#FF9100',
          alert: '#9E76FF',
        },
        variables: {
          'theme-on-purple': '#000',
          'theme-on-green': '#000',
          'theme-on-teal': '#000',
          'theme-on-pink': '#000',
        },
      },
    },
    cspNonce: vuetifyNonce,
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});
