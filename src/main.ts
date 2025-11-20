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
  pegoutMinValue: 0.005,
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
  flyoverGetProvidersTimeout: 5000,
  flyoverPegoutDiffPercentage: 2,
  flyoverProviderId: 2,
  grecaptchaTime: constants.RECAPTCHA_NEW_TOKEN_TIME,
  cspConfiguration: 'https://testnet.lps.tekscapital.com https://staging.lps.tekscapital.com',
  apiResponseTimeout: 5000,
  flyoverNetwork: 'Testnet',
};

EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);

const app = createApp(App);

app.use(i18n);
app.use(router);
app.use(vuetify);
app.use(store);
app.mount('#app');

export default app;
