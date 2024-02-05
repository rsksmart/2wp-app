import { FlyoverPegoutState } from '@/common/types';
import { MutationTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { getClearFlyoverPegoutState } from '@/common/utils/common';

export const mutations: MutationTree<FlyoverPegoutState> = {
  [constants.FLYOVER_PEGOUT_SET_SERVICE]: (state, flyoverService) => {
    state.flyoverService = flyoverService;
  },
  [constants.FLYOVER_PEGOUT_SET_PROVIDERS]: (state, providers) => {
    state.liquidityProviders = providers;
  },
  [constants.FLYOVER_PEGOUT_SET_AMOUNT]: (state, amount) => {
    state.amountToTransfer = amount;
  },
  [constants.FLYOVER_PEGOUT_SET_QUOTES]: (state, quotes) => {
    state.quotes = quotes;
  },
  [constants.FLYOVER_PEGOUT_SET_CLEAR_STATE]: (state) => {
    const clearState = getClearFlyoverPegoutState();
    Object.assign(state, clearState);
  },
  [constants.FLYOVER_PEGOUT_SET_BTC_ADDRESS]: (state, address) => {
    state.btcRecipientAddress = address;
  },
};
