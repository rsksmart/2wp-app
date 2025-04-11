import { FlyoverPegoutState, ObjectDifference } from '@/common/types';
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
  [constants.FLYOVER_PEGOUT_SET_TX_HASH]: (state, txHash: string) => {
    state.txHash = txHash;
  },
  [constants.FLYOVER_PEGOUT_SET_CLEAR_STATE]: (state) => {
    const clearState = getClearFlyoverPegoutState();
    Object.assign(state, clearState);
  },
  [constants.FLYOVER_PEGOUT_SET_BTC_ADDRESS]: (state, address) => {
    state.btcRecipientAddress = address;
  },
  [constants.FLYOVER_PEGOUT_SET_SELECTED_QUOTE]: (state, quoteHash) => {
    state.selectedQuoteHash = quoteHash;
  },
  [constants.FLYOVER_PEGOUT_SET_QUOTES_DIFFERENCE]: (state, difference: ObjectDifference) => {
    state.difference = difference;
  },
  [constants.FLYOVER_PEGOUT_PROVIDERS_SET_AVAILABLE_LIQUIDITY]: (state, payload) => {
    const { providerId, pegoutLiquidity } = payload;
    const providers = state.liquidityProviders;
    providers.forEach((provider, idx) => {
      if (provider.id === providerId) {
        state.liquidityProviders[idx].pegout.availableLiquidity = pegoutLiquidity;
      }
    });
  },
  [constants.FLYOVER_PEGOUT_SET_ACCEPTED_QUOTE_SIGNATURE]: (state, quoteSignature: string) => {
    state.acceptedQuoteSignature = quoteSignature;
  },
};
