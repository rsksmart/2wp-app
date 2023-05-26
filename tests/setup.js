import Vue from 'vue';
import Vuetify from 'vuetify';
import { TextEncoder, TextDecoder } from 'text-encoding';

Vue.use(Vuetify);
Vue.config.productionTip = false;

// Polyfill TextEncoder if it doesn't exist
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

// // Polyfill TextDecoder if it doesn't exist
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
