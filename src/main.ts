import { createApp } from 'vue';
import Web3 from 'web3';
import { AppNetwork } from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import App from './App.vue';
import router from './common/router';
import store from './common/store';
import { vuetify } from './common/plugins/vuetify';
import '@/common/styles/main.scss';

// These environment variables were been set at service/component layer instead of been
// globally set up. We should consider removing them
const defaultEnvironmentVariables = {
  vueAppCoin: constants.BTC_NETWORK_TESTNET as AppNetwork,
  vueAppManifestEmail: '',
  vueAppManifestAppUrl: '',
  vueAppClarityId: 'ibn9mzxbfg',
  pegoutMinValue: 0.004,
  pegoutMaxValue: 1,
  minFeePerKb: {
    fast: 8,
    average: 5,
    slow: 2,
  },
  miningSpeedBlock: {
    fast: 1,
    average: 6,
    slow: 12,
  },
  burnDustValue: 2000,
};

EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);

const app = createApp(App);

app.config.globalProperties.$web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
app.use(router);
app.use(vuetify);
app.use(store);
app.mount('#app');

// Vue.prototype.$web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
if (window.ethereum) {
  window.ethereum.on('accountsChanged', await store.dispatch(`web3Session/${constants.WEB3_SESSION_GET_ACCOUNT}`));
}
// Vue.config.productionTip = false;

export default app;