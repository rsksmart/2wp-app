import {
  FlyoverPegoutState, QuotePegOut2WP, RootState, WeiBig,
} from '@/common/types';
import { ActionTree } from 'vuex';
import * as constants from '@/common/store/constants';

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
  [constants.FLYOVER_PEGOUT_GET_QUOTES]: async ({ state, commit, dispatch }) => {
    const quotePromises: Promise<QuotePegOut2WP[]>[] = [];
    state.liquidityProviders.forEach((provider) => {
      dispatch(constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER, provider.id);
      quotePromises.push(state.flyoverService.getPegoutQuotes(
        state.rskRefundAddress,
        state.btcRecipientAddress,
        state.btcRecipientAddress,
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
      .then(() => commit(constants.FLYOVER_PEGOUT_SET_QUOTES, quotesByProvider));
  },
  [constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER]: ({ state }, providerId: number) => {
    state.flyoverService.useLiquidityProvider(providerId);
  },
  [constants.FLYOVER_PEGOUT_ACCEPT_QUOTE]: async ({ state, commit }, { providerId, quoteHash }:
    { providerId: number; quoteHash: string}) => {
    commit(constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER, providerId);
    state.flyoverService.acceptPegoutQuote(quoteHash);
  },
  [constants.FLYOVER_PEGOUT_CLEAR_STATE]: ({ commit }) => {
    commit(constants.FLYOVER_PEGOUT_SET_CLEAR_STATE);
  },
};
