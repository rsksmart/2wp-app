import Vue from 'vue';
import Web3 from 'web3';
import { ActionTree } from 'vuex';
import RLogin from '@rsksmart/rlogin';
import WalletConnectProvider from '@walletconnect/web3-provider';
import * as constants from '@/store/constants';
import { Web3SessionState } from './types';
import { RootState } from '../types';

export const actions: ActionTree<Web3SessionState, RootState> = {
  [constants.SESSION_CONNECT_WEB3]: async ({ commit }) => {
    const rLogin = new RLogin({
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            rpc: {
              30: 'https://public-node.rsk.co',
              31: 'https://public-node.testnet.rsk.co',
            },
          },
        },
      },
      supportedChains: [30, 31],
    });
    rLogin.connect()
      .then((rLoginResponse) => {
        Vue.prototype.$web3 = new Web3(rLoginResponse.provider);
        commit(constants.SESSION_IS_ENABLED, true);
        commit(constants.SESSION_SET_RLOGIN, rLoginResponse);
      })
      .catch(() => {
        commit(constants.SESSION_IS_ENABLED, false);
      });
  },
  [constants.WEB3_SESSION_GET_ACCOUNT]: async ({ commit }) => {
    const accounts = await Vue.prototype.$web3.eth.getAccounts();
    commit(constants.SESSION_SET_ACCOUNT, accounts[0]);
  },
  [constants.WEB3_SESSION_CLEAR_ACCOUNT]: async ({ commit }) => {
    commit(constants.SESSION_SET_ACCOUNT, undefined);
    commit(constants.SESSION_CLOSE_RLOGIN);
    commit(constants.SESSION_SET_RLOGIN, undefined);
  },
};
