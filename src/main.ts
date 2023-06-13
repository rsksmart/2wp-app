import Vue from 'vue';
import Web3 from 'web3';
import { AppNetwork } from '@/common/types';
import * as constants from './common/store/constants';
import App from './App.vue';
import router from './common/router';
import store from './common/store';
import { vuetify } from './common/plugins/vuetify';
import '@/common/styles/main.scss';
import { EnvironmentAccessorService } from './common/services/enviroment-accessor.service';

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
  vueAppHotjarId: '',
  pegoutMinValue: 0.004,
  pegoutMaxValue: 1,
};

EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
