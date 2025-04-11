import { ActionTree } from 'vuex';
import axios, { AxiosResponse } from 'axios';
import * as constants from '@/common/store/constants';
import {
  TransactionType, SessionState, RootState, WeiBig,
  AppLocale,
  FeatureNames,
} from '@/common/types';
import { ApiService } from '@/common/services';
import {
  getBtcAddressFromSignedMessage,
  getCookie,
  getRloginInstance,
  setCookie,
} from '@/common/utils';
import { ethers, providers } from 'ethers';
import { markRaw } from 'vue';
import { toUtf8Bytes } from 'ethers/lib/utils';
import { useWallet } from '@/common/composables/useWallet';

export const actions: ActionTree<SessionState, RootState> = {
  [constants.SESSION_CONNECT_WEB3]: ({ commit, state, dispatch }): Promise<void> => {
    const rLogin = state.rLoginInstance === undefined
      ? getRloginInstance(state.features) : state.rLoginInstance;
    return new Promise<void>((resolve, reject) => {
      rLogin.connect()
        .then((rLoginResponse) => {
          const provider = new providers.Web3Provider(rLoginResponse.provider);
          commit(constants.SESSION_IS_ENABLED, true);
          commit(constants.SESSION_SET_RLOGIN, rLoginResponse);
          commit(constants.SESSION_SET_RLOGIN_INSTANCE, rLogin);
          commit(constants.SESSION_SET_WEB3_INSTANCE, markRaw(provider));
          provider.on('block', () => dispatch(constants.WEB3_SESSION_ADD_BALANCE));
          return provider.listAccounts();
        })
        .then((accounts) => {
          commit(constants.SESSION_SET_ACCOUNT, accounts[0]);
          return dispatch(constants.WEB3_SESSION_ADD_BALANCE);
        })
        .then(() => dispatch(constants.SESSION_SETUP_EVENTS))
        .then(resolve)
        .catch((e) => {
          commit(constants.SESSION_IS_ENABLED, false);
          commit(constants.SESSION_SET_RLOGIN_INSTANCE, rLogin);
          reject(e);
        });
    });
  },
  [constants.WEB3_SESSION_GET_ACCOUNT]: async ({ state, commit, dispatch }) => {
    const { ethersProvider } = state;
    if (ethersProvider) {
      const accounts = await ethersProvider.listAccounts();
      commit(constants.SESSION_SET_ACCOUNT, accounts[0]);
      dispatch(constants.WEB3_SESSION_ADD_BALANCE);
    }
  },
  [constants.WEB3_SESSION_ADD_BALANCE]: async ({ commit, state }) => {
    const { ethersProvider, account } = state;
    if (ethersProvider && account) {
      const balance = await ethersProvider.getBalance(account);
      commit(constants.WEB3_SESSION_SET_BALANCE, new WeiBig(Number(balance), 'wei'));
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
    async ({ commit }, messageToBeSigned: string): Promise<void> => {
      const { address, provider } = useWallet();
      if (provider.value) {
        const messageHash = ethers.utils.keccak256(toUtf8Bytes(messageToBeSigned));
        const signature = await provider.value.send('personal_sign', [messageHash, address.value, '']);
        const btcAddress = getBtcAddressFromSignedMessage(signature, messageHash || '');
        commit(constants.SESSION_SET_BTC_ACCOUNT, btcAddress);
      }
    },
  [constants.SESSION_ADD_BITCOIN_PRICE]: ({ commit }) => {
    const storedPrice = getCookie('BtcPrice');
    if (storedPrice) {
      commit(constants.SESSION_SET_BITCOIN_PRICE, Number(storedPrice));
    } else {
      axios.get(constants.COINGECKO_API_URL)
        .then((response: AxiosResponse) => {
          const [result] = response.data;
          setCookie('BtcPrice', result.current_price, constants.COOKIE_EXPIRATION_HOURS);
          commit(constants.SESSION_SET_BITCOIN_PRICE, result.current_price);
        })
        .catch(() => {
          commit(constants.SESSION_SET_BITCOIN_PRICE, 0);
        });
    }
  },
  [constants.SESSION_CLEAR]: ({ commit }) => {
    commit(constants.SESSION_CLEAR_STATE);
  },
  [constants.SESSION_ADD_TERMS_VALUE]: ({ commit, getters }, value) => {
    const termsFeature = getters[constants.SESSION_GET_FEATURE](FeatureNames.TERMS_AND_CONDITIONS);
    if (value) {
      localStorage.setItem('TERMS_AND_CONDITIONS_ACCEPTED', String(termsFeature.version));
    } else {
      localStorage.removeItem('TERMS_AND_CONDITIONS_ACCEPTED');
    }
    commit(constants.SESSION_SET_TERMS_ACCEPTED, value);
  },
  [constants.SESSION_ADD_FEATURES]: async ({ commit, dispatch }) => {
    try {
      const features = await ApiService.getFeatures();
      commit(constants.SESSION_SET_FEATURES, features);
      const flag = features
        .find(({ name }) => name === FeatureNames.TERMS_AND_CONDITIONS);
      if (!flag?.version) return;
      const versionAccepted = Number(localStorage.getItem('TERMS_AND_CONDITIONS_ACCEPTED'));
      dispatch(constants.SESSION_ADD_TERMS_VALUE, flag?.version === versionAccepted);
    } catch (e) {
      dispatch(constants.SESSION_ADD_TERMS_VALUE, false);
    }
  },
  [constants.SESSION_SWITCH_LOCALE]: ({ commit }, locale: AppLocale) => {
    commit(constants.SESSION_SET_LOCALE, locale);
  },
  [constants.SESSION_ADD_API_VERSION]: ({ commit }) => {
    const version = getCookie('2wpApiVersion');
    if (version) {
      commit(constants.SESSION_SET_API_VERSION, version);
    } else {
      ApiService.getApiInformation()
        .then(({ version: apiVersion }) => {
          const expirationHours = 48;
          setCookie('2wpApiVersion', apiVersion, expirationHours);
          commit(constants.SESSION_SET_API_VERSION, apiVersion);
        });
    }
  },
  [constants.SESSION_SETUP_EVENTS]: ({ state, dispatch }) => {
    const { rLoginInstance } = state;
    rLoginInstance?.on('accountsChanged', () => {
      dispatch(constants.WEB3_SESSION_GET_ACCOUNT);
    });
  },
  [constants.SESSION_COUNTDOWN_GRECAPTCHA_TIME]: ({ state, commit, dispatch }) => {
    const intervalId = setInterval(() => {
      if (state.grecaptchaCountdown > 0) {
        commit(constants.SESSION_SET_DECREMENT_GRECAPTCHA_COUNTDOWN);
      } else {
        dispatch(constants.SESSION_CLEAR_GRECAPTCHA_INTERVAL);
      }
    }, 1000);
    commit(constants.SESSION_SET_GRECAPTCHA_INTERVAL, intervalId);
  },
  [constants.SESSION_CLEAR_GRECAPTCHA_INTERVAL]: ({ state, commit }) => {
    const { grecaptchaIntervalId } = state;
    if (grecaptchaIntervalId) {
      clearInterval(grecaptchaIntervalId);
      commit(constants.SESSION_RESET_GRECAPTCHA_COUNTDOWN);
    }
  },
};
