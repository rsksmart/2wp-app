import { createApp } from 'vue';
import { AppNetwork } from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import i18n from '@/i18n';
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
  vueAppHotjarId: '',
  vueAppClarityId: '',
  peginMinValue: 0.005,
  peginMaxValue: 10,
  pegoutMinValue: 0.005,
  pegoutMaxValue: 10,
  minFeeSatPerByte: {
    fast: 8,
    average: 4,
    slow: 1,
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

app.use(i18n);
app.use(router);
app.use(vuetify);
app.use(store);
app.mount('#app');

if (localStorage.getItem('RLOGIN_CACHED_PROVIDER')) {
  await store.dispatch(`web3Session/${constants.SESSION_CONNECT_WEB3_FROM_CACHE}`);
}

if (window.ethereum) {
  window.ethereum.on('accountsChanged', await store.dispatch(`web3Session/${constants.WEB3_SESSION_GET_ACCOUNT}`));
}

export default app;
