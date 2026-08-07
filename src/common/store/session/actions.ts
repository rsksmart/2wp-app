import { ActionTree } from 'vuex';
import axios, { AxiosResponse } from 'axios';
import * as constants from '@/common/store/constants';
import {
  TransactionType, SessionState, RootState, WeiBig,
  AppLocale,
  FeatureNames,
} from '@/common/types';
import { ApiService } from '@/common/services';
import { captureError } from '@/sentry';
import {
  getBtcAddressFromSignedMessage,
  getCookie,
  getRloginInstance,
  ServiceError,
  setCookie,
} from '@/common/utils';
import { ethers, providers } from 'ethers';
import { markRaw } from 'vue';
import { toUtf8Bytes } from 'ethers/lib/utils';

type EIP1193EventEmitter = {
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
};

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
  [constants.SESSION_CONNECT_REOWN_WEB3]:
  ({ commit, dispatch }, payload: {
    provider: providers.Web3Provider;
    walletName?: string;
  }) => new Promise<void>((resolve) => {
    const { provider, walletName } = payload;
    commit(constants.SESSION_IS_ENABLED, true);
    commit(constants.SESSION_SET_WEB3_INSTANCE, markRaw(provider));
    commit(constants.SESSION_SET_RLOGIN_INSTANCE, undefined);
    commit(constants.SESSION_SET_RLOGIN, undefined);
    commit(constants.SESSION_SET_CONNECTED_WALLET_NAME, walletName);
    provider.on('block', () => dispatch(constants.WEB3_SESSION_ADD_BALANCE));
    provider.listAccounts()
      .then((accounts) => {
        commit(constants.SESSION_SET_ACCOUNT, accounts[0]);
        return dispatch(constants.WEB3_SESSION_ADD_BALANCE);
      })
      .then(() => dispatch(constants.SESSION_SETUP_EVENTS))
      .then(resolve);
  }),
  [constants.WEB3_SESSION_GET_ACCOUNT]: async ({ state, commit, dispatch }) => {
    const { ethersProvider, account: previousAccount } = state;
    if (ethersProvider) {
      const accounts = await ethersProvider.listAccounts();
      const [currentAccount] = accounts;
      // A derived beneficiary and any quote bound to it belong to the previous account only.
      if (previousAccount?.toLowerCase() !== currentAccount?.toLowerCase()) {
        await dispatch(constants.SESSION_CLEAR_IDENTITY);
      }
      commit(constants.SESSION_SET_ACCOUNT, currentAccount);
      dispatch(constants.WEB3_SESSION_ADD_BALANCE);
    }
  },
  [constants.SESSION_CLEAR_IDENTITY]: async ({ commit, dispatch }) => {
    commit(constants.SESSION_SET_BTC_ACCOUNT, '');
    commit(`pegInTx/${constants.PEGIN_TX_SET_RSK_ADDRESS}`, '', { root: true });
    await Promise.all([
      dispatch(`flyoverPegout/${constants.FLYOVER_PEGOUT_ADD_BTC_ADDRESS}`, '', { root: true }),
      dispatch(`flyoverPegin/${constants.FLYOVER_PEGIN_ADD_ROOTSTOCK_ADDRESS}`, '', { root: true }),
      dispatch(`flyoverPegout/${constants.FLYOVER_PEGOUT_CLEAR_QUOTES}`, undefined, { root: true }),
      dispatch(`flyoverPegin/${constants.FLYOVER_PEGIN_CLEAR_QUOTES}`, undefined, { root: true }),
    ]);
  },
  [constants.SESSION_REVALIDATE_ACCOUNT]: async ({ state, dispatch }): Promise<string> => {
    const { ethersProvider, account } = state;
    if (!ethersProvider || !account) {
      throw new ServiceError(
        'SessionService',
        constants.SESSION_REVALIDATE_ACCOUNT,
        'No connected Rootstock account. Please connect your wallet and start again.',
        'SESSION_REVALIDATE_ACCOUNT called without a provider or account',
      );
    }
    const [currentAccount] = await ethersProvider.listAccounts();
    if (!currentAccount || currentAccount.toLowerCase() !== account.toLowerCase()) {
      await dispatch(constants.SESSION_CLEAR_IDENTITY);
      throw new ServiceError(
        'SessionService',
        constants.SESSION_REVALIDATE_ACCOUNT,
        'The connected Rootstock account changed. Please reconnect and start again.',
        `Wallet reported ${currentAccount} while ${account} was the connected account`,
      );
    }
    return account;
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
    async ({ commit, state }, messageToBeSigned: string): Promise<void> => {
      if (!state.ethersProvider) return;
      // Captured before awaiting so a mid-signing account swap can be detected.
      const signerAccount = state.account;
      if (!signerAccount) {
        throw new Error('No connected account to sign with');
      }
      const messageHash = ethers.utils.keccak256(toUtf8Bytes(messageToBeSigned));
      const signature = await state.ethersProvider.send('personal_sign', [messageHash, signerAccount, '']);
      // The beneficiary Bitcoin address is derived from whoever signed, so the signature
      // must be proven to come from the connected account before it is trusted.
      const recovered = ethers.utils.verifyMessage(ethers.utils.arrayify(messageHash), signature);
      if (recovered.toLowerCase() !== signerAccount.toLowerCase()) {
        throw new Error('Signature does not belong to the connected account');
      }
      if (state.account?.toLowerCase() !== signerAccount.toLowerCase()) {
        throw new Error('Account changed during signing');
      }
      const btcAddress = getBtcAddressFromSignedMessage(signature, messageHash);
      commit(constants.SESSION_SET_BTC_ACCOUNT, btcAddress);
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
        .catch((e) => {
          captureError(e, { source: constants.SESSION_ADD_BITCOIN_PRICE });
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
      captureError(e, { source: constants.SESSION_ADD_FEATURES });
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
    const { rLoginInstance, ethersProvider } = state;
    rLoginInstance?.on('accountsChanged', () => {
      dispatch(constants.WEB3_SESSION_GET_ACCOUNT);
    });
    // rLogin only forwards accountsChanged, and the Reown/AppKit path has no rLogin instance
    // at all, so subscribe to the EIP-1193 provider directly. Any change of account, chain or
    // wallet session must invalidate the identity-derived beneficiary and its quotes.
    const walletProvider = ethersProvider?.provider as EIP1193EventEmitter | undefined;
    if (typeof walletProvider?.on !== 'function') return;
    walletProvider.on('accountsChanged', () => {
      dispatch(constants.WEB3_SESSION_GET_ACCOUNT);
    });
    walletProvider.on('chainChanged', () => {
      dispatch(constants.SESSION_CLEAR_IDENTITY);
    });
    walletProvider.on('disconnect', () => {
      dispatch(constants.WEB3_SESSION_CLEAR_ACCOUNT);
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
