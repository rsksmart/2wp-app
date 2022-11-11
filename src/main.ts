import Vue from 'vue';
import Web3 from 'web3';
import { AppNetwork } from '@/types';
import VueTour from 'vue-tour';
import * as constants from './store/constants';
import App from './App.vue';
import router from './router';
import store from './store';
import { vuetify } from './plugins/vuetify';
import '@/styles/main.scss';
import { EnvironmentAccessorService } from './services/enviroment-accessor.service';

require('vue-tour/dist/vue-tour.css');

Vue.config.productionTip = false;
Vue.prototype.$web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');

if (window.ethereum) {
  window.ethereum.on('accountsChanged', async () => {
    await store.dispatch(`web3Session/${constants.WEB3_SESSION_GET_ACCOUNT}`);
  });
}

// These environment variables were been set at service/component layer instead of been
// globally set up. We should consider removing them
const defaultEnvironmentVariables = {
  vueAppCoin: constants.BTC_NETWORK_TESTNET as AppNetwork,
  vueAppManifestEmail: '',
  vueAppManifestAppUrl: '',
  vueAppWalletMaxCallTrezor: '1',
  vueAppWalletAddressesPerCallTrezor: '10',
  vueAppWalletMaxCallLedger: '2',
  vueAppWalletAddressesPerCallLedger: '2',
  vueAppHotjarId: '',
  pegoutMinValue: 0.004,
  pegoutMaxValue: 1,
};

EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);

Vue.use(VueTour);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
