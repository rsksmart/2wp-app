import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import crypto from "crypto";
import '@mdi/font/css/materialdesignicons.css';

export const vuetifyNonce = crypto.randomBytes(8).toString('hex');

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    options: {
      cspNonce: vuetifyNonce,
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});
