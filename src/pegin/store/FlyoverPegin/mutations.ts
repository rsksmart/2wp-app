import {
  FlyoverPeginState, LiquidityProvider2WP, QuotePegIn2WP, SatoshiBig,
} from '@/common/types';
import { MutationTree } from 'vuex';
import * as constants from '@/common/store/constants';

export const mutations: MutationTree<FlyoverPeginState> = {
  [constants.FLYOVER_PEGIN_SET_AMOUNT]: (state, amount: SatoshiBig) => {
    state.amountToTransfer = amount;
  },
  [constants.FLYOVER_PEGIN_SET_ROOTSTOCK_ADDRESS]: (state, address: string) => {
    state.rootstockRecipientAddress = address;
  },
  [constants.FLYOVER_PEGIN_SET_PROVIDERS]: (state, providers: Array<LiquidityProvider2WP>) => {
    state.liquidityProviders = providers;
  },
  [constants.FLYOVER_PEGIN_SET_QUOTES]: (state, quotes: Record<number, Array<QuotePegIn2WP>>) => {
    state.quotes = quotes;
  },
  [constants.FLYOVER_PEGIN_SET_SELECTED_QUOTE]: (state, quoteHash: string) => {
    state.selectedQuoteHash = quoteHash;
  },
};
