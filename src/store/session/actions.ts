import Vue from 'vue';
import Web3 from 'web3';
import { ActionTree } from 'vuex';
import RLogin from '@rsksmart/rlogin';
import WalletConnectProvider from '@walletconnect/web3-provider';
import * as constants from '@/store/constants';
import { TransactionType, SessionState } from './types';
import { RootState } from '@/types';

export const actions: ActionTree<SessionState, RootState> = {
  [constants.SESSION_CONNECT_WEB3]: ({ commit, state }): Promise<void> => {
    const rLogin = state.rLoginInstance === undefined ? new RLogin({
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
    }) : state.rLoginInstance;
    return new Promise<void>((resolve, reject) => {
      rLogin.connect()
        .then((rLoginResponse) => {
          const web3 = new Web3(rLoginResponse.provider);
          Vue.prototype.$web3 = web3;
          commit(constants.SESSION_IS_ENABLED, true);
          commit(constants.SESSION_SET_RLOGIN, rLoginResponse);
          commit(constants.SESSION_SET_RLOGIN_INSTANCE, rLogin);
          commit(constants.SESSION_SET_WEB3_INSTANCE, web3);
          return Vue.prototype.$web3.eth.getAccounts();
        }).then((accounts) => {
          resolve(commit(constants.SESSION_SET_ACCOUNT, accounts[0]));
        })
        .catch((e) => {
          commit(constants.SESSION_IS_ENABLED, false);
          commit(constants.SESSION_SET_RLOGIN_INSTANCE, rLogin);
          reject(e);
        });
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
  [constants.SESSION_ADD_TX_TYPE]: ({ commit }, peg: TransactionType): void => {
    commit(constants.SESSION_SET_TX_TYPE, peg);
  },
};
