import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import crypto from 'crypto';

Vue.use(Vuetify);

export const vuetifyNonce = crypto.randomBytes(8).toString('hex');

export const vuetify = new Vuetify({
  theme: {
    options: { cspNonce: vuetifyNonce },
  },
});
