import { FlyoverPegoutState, RootState, WeiBig } from '@/common/types';
import { ActionTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { FlyoverService } from '@/common/services';

export const actions: ActionTree<FlyoverPegoutState, RootState> = {
  [constants.FLYOVER_PEGOUT_INIT]: async ({ commit, dispatch }) => {
    const flyoverService = new FlyoverService();
    flyoverService.initialize()
      .then(() => commit(constants.FLYOVER_PEGOUT_SET_SERVICE, flyoverService))
      .then(() => dispatch(constants.FLYOVER_PEGOUT_GET_PROVIDERS));
  },
  [constants.FLYOVER_PEGOUT_GET_PROVIDERS]: async ({ state, commit }) => {
    state.flyoverService?.getProviders()
      .then((providers) => commit(constants.FLYOVER_PEGOUT_SET_PROVIDERS, providers))
      .catch((e) => console.log(e)); // FIXME
  },
  [constants.FLYOVER_PEGOUT_ADD_AMOUNT]: ({ commit }, amount: WeiBig) => {
    commit(constants.FLYOVER_PEGOUT_SET_AMOUNT, amount);
  },
  [constants.FLYOVER_PEGOUT_GET_QUOTES]: async ({ state, commit, dispatch }) => {
    state.liquidityProviders.forEach((provider) => {
      dispatch(constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER, provider.id);
      state.flyoverService?.getPegoutQuotes(
        state.rskRefundAddress,
        state.btcRecipientAddress,
        state.btcRecipientAddress,
        state.amountToTransfer,
      ).then((quotes) => {
        commit(constants.FLYOVER_PEGOUT_SET_QUOTES, { [provider.id]: quotes });
      });
    });
  },
  [constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER]: ({ state }, providerId: number) => {
    state.flyoverService?.useLiquidityProvider(providerId);
  },
  [constants.FLYOVER_PEGOUT_ACCEPT_QUOTE]: async ({ state }, quoteHash: string) => {
    state.flyoverService?.acceptPegoutQuote(quoteHash);
  },
  [constants.FLYOVER_PEGOUT_CLEAR_STATE]: ({ commit }) => {
    commit(constants.FLYOVER_PEGOUT_SET_CLEAR_STATE);
  },
};
