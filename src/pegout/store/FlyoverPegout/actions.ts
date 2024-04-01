import {
  FlyoverPegoutState, QuotePegOut2WP, RootState, WeiBig,
} from '@/common/types';
import { ActionTree } from 'vuex';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export const actions: ActionTree<FlyoverPegoutState, RootState> = {
  [constants.FLYOVER_PEGOUT_INIT]: async ({ state, dispatch }) => {
    state.flyoverService.initialize()
      .then(() => dispatch(constants.FLYOVER_PEGOUT_GET_PROVIDERS));
  },
  [constants.FLYOVER_PEGOUT_GET_PROVIDERS]: async ({ state, commit }) => {
    state.flyoverService.getProviders()
      .then((providers) => commit(constants.FLYOVER_PEGOUT_SET_PROVIDERS, providers))
      .catch((e) => console.log(e));
  },
  [constants.FLYOVER_PEGOUT_ADD_AMOUNT]: ({ commit }, amount: WeiBig) => {
    commit(constants.FLYOVER_PEGOUT_SET_AMOUNT, amount);
  },
  [constants.FLYOVER_PEGOUT_ADD_BTC_ADDRESS]: ({ commit }, address: string) => {
    commit(constants.FLYOVER_PEGOUT_SET_BTC_ADDRESS, address);
  },
  [constants.FLYOVER_PEGOUT_GET_QUOTES]: async (
    { state, commit, dispatch },
    rskRefundAddress: string,
  ) => new Promise<void>((resolve, reject) => {
    const quotePromises: Promise<QuotePegOut2WP[]>[] = [];
    state.liquidityProviders.forEach((provider) => {
      dispatch(constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER, provider.id);
      const tempBtcAddress = EnvironmentContextProviderService
        .getEnvironmentContext()
        .getBitcoinAddress();
      quotePromises.push(state.flyoverService.getPegoutQuotes(
        rskRefundAddress,
        state.btcRecipientAddress ? state.btcRecipientAddress : tempBtcAddress,
        state.btcRecipientAddress ? state.btcRecipientAddress : tempBtcAddress,
        state.amountToTransfer,
      ));
    });
    let quotesByProvider: Record<number, QuotePegOut2WP[]> = {};
    Promise.all(quotePromises)
      .then((quotes) => quotes.forEach((providerQuotes, index) => {
        quotesByProvider = {
          ...quotesByProvider,
          [state.liquidityProviders[index].id]: providerQuotes,
        };
      }))
      .then(() => {
        commit(constants.FLYOVER_PEGOUT_SET_QUOTES, quotesByProvider);
        resolve();
      })
      .catch(reject);
  }),
  [constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER]: ({ state }, providerId: number) => {
    state.flyoverService.useLiquidityProvider(providerId);
  },
  [constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE]:
    ({
      state, getters, dispatch, commit,
    }, quoteHash: string) => new Promise((resolve, reject) => {
      const providerId = getters[constants.FLYOVER_PEGOUT_GET_PROVIDER_ID](quoteHash);
      if (providerId === -1) {
        reject(new Error('No provider found for quote'));
      }
      dispatch(constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER, providerId);
      commit(constants.FLYOVER_PEGOUT_SET_SELECTED_QUOTE, quoteHash);
      state.flyoverService.acceptAndSendPegoutQuote(quoteHash)
        .then((txHash) => commit(constants.FLYOVER_PEGOUT_SET_TX_HASH, txHash))
        .then(resolve)
        .catch(reject);
    }),
  [constants.FLYOVER_PEGOUT_CLEAR_STATE]: ({ commit }) => {
    commit(constants.FLYOVER_PEGOUT_SET_CLEAR_STATE);
  },
};
