import {
  FlyoverPeginState, QuotePegIn2WP, RootState, SatoshiBig, WeiBig,
} from '@/common/types';
import { ActionTree } from 'vuex';
import * as constants from '@/common/store/constants';

export const actions: ActionTree<FlyoverPeginState, RootState> = {
  [constants.FLYOVER_PEGIN_INIT]: ({ state, dispatch }) => new Promise((resolve, reject) => {
    state.flyoverService.initialize()
      .then(() => dispatch(constants.FLYOVER_PEGIN_GET_PROVIDERS))
      .then(resolve)
      .catch(reject);
  }),
  [constants.FLYOVER_PEGIN_GET_PROVIDERS]: ({ state, commit }) => new Promise((resolve, reject) => {
    state.flyoverService.getProviders()
      .then((providers) => resolve(commit(constants.FLYOVER_PEGIN_SET_PROVIDERS, providers)))
      .catch(reject);
  }),
  [constants.FLYOVER_PEGIN_ADD_AMOUNT]: ({ commit }, amount: SatoshiBig) => {
    commit(constants.FLYOVER_PEGIN_SET_AMOUNT, amount);
  },
  [constants.FLYOVER_PEGIN_ADD_ROOTSTOCK_ADDRESS]: ({ commit }, address: string) => {
    commit(constants.FLYOVER_PEGIN_SET_ROOTSTOCK_ADDRESS, address);
  },
  [constants.FLYOVER_PEGIN_USE_LIQUIDITY_PROVIDER]: ({ state }, providerId: number) => {
    state.flyoverService.useLiquidityProvider(providerId);
  },
  [constants.FLYOVER_PEGIN_GET_QUOTES]:
  (
    { state, commit, dispatch },
    { rootstockRecipientAddress, bitcoinRefundAddress },
  ) => new Promise((resolve, reject) => {
    const quotePromises: Promise<QuotePegIn2WP[]>[] = [];
    state.liquidityProviders.forEach((provider) => {
      dispatch(constants.FLYOVER_PEGIN_USE_LIQUIDITY_PROVIDER, provider.id);
      quotePromises.push(state.flyoverService.getPeginQuotes(
        rootstockRecipientAddress,
        bitcoinRefundAddress,
        state.amountToTransfer,
      ));
    });
    let quotesByProvider: Record<number, QuotePegIn2WP[]> = {};
    Promise.allSettled(quotePromises)
      .then((responses) => responses.forEach((response, index) => {
        if (response.status === 'fulfilled') {
          quotesByProvider = {
            ...quotesByProvider,
            [state.liquidityProviders[index].id]: response.value,
          };
        }
      }))
      .then(() => resolve(commit(constants.FLYOVER_PEGIN_SET_QUOTES, quotesByProvider)))
      .catch(reject);
  }),
  [constants.FLYOVER_PEGIN_ADD_SELECTED_QUOTE]: ({ commit }, quoteHash: string) => {
    commit(constants.FLYOVER_PEGIN_SET_SELECTED_QUOTE, quoteHash);
  },
  [constants.FLYOVER_PEGIN_CLEAR_QUOTES]: ({ commit }) => {
    commit(constants.FLYOVER_PEGIN_SET_QUOTES, {});
  },
  [constants.FLYOVER_PEGIN_GET_AVAILABLE_LIQUIDITY]:
    ({ state, dispatch, commit }) => new Promise((resolve, reject) => {
      const providersPromises:
        Promise<number | {
          providerId: number,
          peginLiquidity: WeiBig,
          pegoutLiquidity: SatoshiBig
        }>[] = [];
      state.liquidityProviders.forEach((provider) => {
        dispatch(constants.FLYOVER_PEGIN_USE_LIQUIDITY_PROVIDER, provider.id);
        providersPromises.push(state.flyoverService.getAvailableLiquidity());
      });
      Promise.allSettled(providersPromises)
        .then((responses) => responses.forEach((response) => {
          if (response.status === 'fulfilled') {
            if (response.value instanceof Object) {
              const { providerId, peginLiquidity } = response.value;
              commit(
                constants.FLYOVER_PEGIN_PROVIDERS_SET_AVAILABLE_LIQUIDITY,
                { providerId, peginLiquidity },
              );
            }
          }
        }))
        .catch(reject);
    }),
};
