import Vue from 'vue';
import Web3 from 'web3';
import store from '@/store';
import { ActionTree } from 'vuex';
import * as constants from '@/store/constants';
import { Web3SessionState } from './types';
import { RootState } from '../types';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
if (window.ethereum) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
  window.ethereum.on('accountsChanged', () => {
    store.web3Session.dispatch(constants.SESSION_CONNECT_WEB3);
  });
}

export const actions: ActionTree<Web3SessionState, RootState> = {
  [constants.SESSION_CONNECT_WEB3]: ({ commit }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (window.ethereum) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      Vue.prototype.$web3 = new Web3(window.ethereum);
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      window.ethereum.enable();
      commit(constants.SESSION_IS_ENABLED, true);
    }
    commit(constants.SESSION_IS_ENABLED, false);
  },
  [constants.WEB3_SESSION_GET_ACCOUNT]: async ({ commit }) => {
    const accounts = await Vue.prototype.$web3.eth.getAccounts();
    commit(constants.SESSION_SET_ACCOUNT, accounts[0]);
  },
};
