import Vue from 'vue';
import Web3 from 'web3';
import { ActionTree } from 'vuex';
import * as constants from '@/store/constants';
import { Web3SessionState } from './types';
import { RootState } from '../types';

export const actions: ActionTree<Web3SessionState, RootState> = {
  [constants.SESSION_CONNECT_WEB3]: async ({ commit }) => {
    if (window.ethereum) {
      try {
        window.ethereum.enable();
        Vue.prototype.$web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log(accounts);
        commit(constants.SESSION_IS_ENABLED, true);
      } catch (error) {
        commit(constants.SESSION_IS_ENABLED, false);
      }
    }
  },
  [constants.WEB3_SESSION_GET_ACCOUNT]: async ({ commit }) => {
    const accounts = await Vue.prototype.$web3.eth.getAccounts();
    commit(constants.SESSION_SET_ACCOUNT, accounts[0]);
  },
  [constants.WEB3_SESSION_CLEAR_ACCOUNT]: async ({ commit }) => {
    commit(constants.SESSION_SET_ACCOUNT, undefined);
  },
};
