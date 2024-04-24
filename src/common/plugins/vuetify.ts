import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import 'vuetify/styles';
import crypto from 'crypto';

export const vuetifyNonce = crypto.randomBytes(8).toString('hex');

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
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
