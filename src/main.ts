import Vue from 'vue';
import Web3 from 'web3';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import '@/styles/main.scss';

Vue.config.productionTip = false;
Vue.prototype.$web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
