import Vue from 'vue';
import Web3 from 'web3';
import { ActionTree } from 'vuex';
import RLogin from '@rsksmart/rlogin';
import WalletConnectProvider from '@walletconnect/web3-provider';
import * as constants from '@/store/constants';
import {
  TransactionType, SessionState, RootState, WeiBig,
} from '@/types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { getBtcAddressFromSignedMessage } from '@/utils';

export const actions: ActionTree<SessionState, RootState> = {
  [constants.SESSION_CONNECT_WEB3]: ({ commit, state }): Promise<void> => {
    const rpcUrls = {};
    const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
    if (network === constants.BTC_NETWORK_MAINNET) {
      Object
        .defineProperty(rpcUrls, constants.SUPPORTED_NETWORKS.RSK_MAINNET.chainId, {
          value: constants.SUPPORTED_NETWORKS.RSK_MAINNET.rpcUrl,
          writable: false,
          configurable: true,
          enumerable: true,
        });
    } else {
      Object
        .defineProperty(rpcUrls, constants.SUPPORTED_NETWORKS.RSK_TESTNET.chainId, {
          value: constants.SUPPORTED_NETWORKS.RSK_TESTNET.rpcUrl,
          writable: false,
          configurable: true,
          enumerable: true,
        });
    }
    const supportedChains = Object.keys(rpcUrls).map(Number);
    const rLogin = state.rLoginInstance === undefined ? new RLogin({
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            rpc: rpcUrls,
          },
        },
      },
      rpcUrls,
      supportedChains,
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
  [constants.WEB3_SESSION_ADD_BALANCE]: async ({ commit, state }) => {
    const balance = await Vue.prototype.$web3.eth.getBalance(state.account);
    return commit(constants.WEB3_SESSION_SET_BALANCE, new WeiBig(balance, 'wei'));
  },
  [constants.WEB3_SESSION_CLEAR_ACCOUNT]: async ({ commit }) => {
    commit(constants.SESSION_SET_ACCOUNT, undefined);
    commit(constants.SESSION_CLOSE_RLOGIN);
    commit(constants.SESSION_SET_RLOGIN, undefined);
  },
  [constants.SESSION_ADD_TX_TYPE]: ({ commit }, peg: TransactionType): void => {
    commit(constants.SESSION_SET_TX_TYPE, peg);
  },
  [constants.SESSION_SIGN_MESSAGE]:
    async ({ commit, state }, messageToBeSigned: string): Promise<void> => {
      const web3: Web3 = Vue.prototype.$web3;
      const messageHex = web3.utils.utf8ToHex(messageToBeSigned);
      const signature = await web3.eth.personal.sign(messageHex, state.account || '0', '');
      const btcAddress = getBtcAddressFromSignedMessage(signature, web3.utils.sha3(messageToBeSigned) || '');
      commit(constants.SESSION_SET_BTC_ACCOUNT, btcAddress);
    },
};
