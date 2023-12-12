import Web3 from 'web3';
import { ActionTree } from 'vuex';
import RLogin from '@rsksmart/rlogin';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { trezorProviderOptions } from '@rsksmart/rlogin-trezor-provider';
import { ledgerProviderOptions } from '@rsksmart/rlogin-ledger-provider';
import axios, { AxiosResponse } from 'axios';
import * as constants from '@/common/store/constants';
import {
  TransactionType, SessionState, RootState, WeiBig,
} from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { getBtcAddressFromSignedMessage } from '@/common/utils';
import { ApiService } from '@/common/services';

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
    const customLedgerProviderOptions = ledgerProviderOptions;
    customLedgerProviderOptions.connector = async (ProviderPackage, options) => {
      const ledgerOptions = options;
      ledgerOptions.messageHashed = true;
      const provider = new ProviderPackage(ledgerOptions);
      await provider.connect();
      return provider;
    };
    const rLogin = state.rLoginInstance === undefined ? new RLogin({
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            rpc: rpcUrls,
          },
        },
        'custom-ledger': customLedgerProviderOptions,
        'custom-trezor': {
          ...trezorProviderOptions,
          options: {
            dPath: "m/44'/37310'/0'/0/0",
            manifestEmail: EnvironmentAccessorService
              .getEnvironmentVariables().vueAppManifestEmail,
            manifestAppUrl: EnvironmentAccessorService
              .getEnvironmentVariables().vueAppManifestAppUrl,
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
          commit(constants.SESSION_IS_ENABLED, true);
          commit(constants.SESSION_SET_RLOGIN, rLoginResponse);
          commit(constants.SESSION_SET_RLOGIN_INSTANCE, rLogin);
          commit(constants.SESSION_SET_WEB3_INSTANCE, web3);
          return web3.eth.getAccounts();
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
  [constants.WEB3_SESSION_GET_ACCOUNT]: async ({ state, commit }) => {
    const { web3 } = state;
    if (web3) {
      const accounts = await web3.eth.getAccounts();
      commit(constants.SESSION_SET_ACCOUNT, accounts[0]);
    }
  },
  [constants.WEB3_SESSION_ADD_BALANCE]: async ({ commit, state }) => {
    const { web3, account } = state;
    if (web3 && account) {
      const balance = await web3.eth.getBalance(account);
      commit(constants.WEB3_SESSION_SET_BALANCE, new WeiBig(balance, 'wei'));
    }
  },
  [constants.WEB3_SESSION_CLEAR_ACCOUNT]: async ({ commit }) => {
    commit(constants.SESSION_SET_ACCOUNT, undefined);
    commit(constants.SESSION_CLOSE_RLOGIN);
    commit(constants.SESSION_SET_RLOGIN, undefined);
    commit(constants.SESSION_SET_BTC_ACCOUNT, '');
  },
  [constants.SESSION_ADD_TX_TYPE]: ({ commit }, peg: TransactionType): void => {
    commit(constants.SESSION_SET_TX_TYPE, peg);
  },
  [constants.SESSION_SIGN_MESSAGE]:
    async ({ commit, state }, messageToBeSigned: string): Promise<void> => {
      if (state.web3) {
        const messageHash = state.web3.utils.keccak256(messageToBeSigned);
        const signature = await state.web3.eth.personal.sign(messageHash, state.account || '0', '');
        const btcAddress = getBtcAddressFromSignedMessage(signature, messageHash || '');
        commit(constants.SESSION_SET_BTC_ACCOUNT, btcAddress);
      }
    },
  [constants.SESSION_ADD_BITCOIN_PRICE]: ({ commit }) => axios.get(constants.COINGECKO_API_URL)
    .then((response: AxiosResponse) => {
      const [result] = response.data;
      commit(constants.SESSION_SET_BITCOIN_PRICE, result.current_price);
    })
    .catch(() => {
      commit(constants.SESSION_SET_BITCOIN_PRICE, 0);
    })
    .finally(() => {
      commit(constants.SESSION_SET_TX_TYPE, 'PEG_IN_TRANSACTION_TYPE');
    }),
  [constants.SESSION_CLEAR]: ({ commit }) => {
    commit(constants.SESSION_CLEAR_STATE);
  },
  [constants.SESSION_ADD_TERMS_VALUE]: ({ commit, state }, value) => {
    if (value) {
      localStorage.setItem('TERMS_AND_CONDITIONS_ACCEPTED', String(state.termsAndConditionsEnabled?.version));
    } else {
      localStorage.removeItem('TERMS_AND_CONDITIONS_ACCEPTED');
    }
    commit(constants.SESSION_SET_TERMS_ACCEPTED, value);
  },
  [constants.SESSION_ADD_TERMS_AND_CONDITIONS_ENABLED]: async ({ commit, dispatch }) => {
    try {
      const features = await ApiService.getFeatures();
      const flag = features.find(({ name }) => name === 'terms_and_conditions');
      if (!flag?.version) return;
      const versionAccepted = Number(localStorage.getItem('TERMS_AND_CONDITIONS_ACCEPTED'));
      commit(constants.SESSION_SET_TERMS_AND_CONDITIONS_ENABLED, flag);
      dispatch(constants.SESSION_ADD_TERMS_VALUE, flag?.version === versionAccepted);
    } catch (e) {
      dispatch(constants.SESSION_ADD_TERMS_VALUE, false);
    }
  },
};
