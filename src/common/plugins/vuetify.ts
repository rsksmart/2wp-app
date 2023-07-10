import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import crypto from "crypto";

export const vuetifyNonce = crypto.randomBytes(8).toString('hex');

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    options: {
      cspNonce: vuetifyNonce,
    },
  },
});
