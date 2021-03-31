import Vue from 'vue';
import Web3 from 'web3';
import * as constants from './store/constants';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import '@/styles/main.scss';

Vue.config.productionTip = false;
Vue.prototype.$web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');

if (window.ethereum) {
  window.ethereum.on('accountsChanged', async () => {
    await store.dispatch(`web3Session/${constants.WEB3_SESSION_GET_ACCOUNT}`);
  });
}

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
