import { FlyoverPeginState, RootState } from '@/common/types';
import { GetterTree } from 'vuex';
import * as constants from '@/common/store/constants';

export const getters: GetterTree<FlyoverPeginState, RootState> = {
  [constants.FLYOVER_PEGIN_GET_SELECTED_QUOTE]: (state) => {
    let quoteFound;
    Object.entries(state.quotes).forEach(([, quotes]) => {
      const selectedQuote = quotes.find((quote) => quote.quoteHash === state.selectedQuoteHash);
      if (selectedQuote) {
        quoteFound = selectedQuote;
      }
    });
    return quoteFound;
  },
  [constants.FLYOVER_PEGIN_GET_SELECTED_FEE]: (state, _, rootState) => {
    const selectedFee = rootState.pegInTx?.selectedFee;
    switch (selectedFee) {
      case constants.BITCOIN_AVERAGE_FEE_LEVEL:
        return state.calculatedTxFees.average;
      case constants.BITCOIN_FAST_FEE_LEVEL:
        return state.calculatedTxFees.fast;
      case constants.BITCOIN_SLOW_FEE_LEVEL:
        return state.calculatedTxFees.slow;
      default:
        return state.calculatedTxFees.average;
    }
  },
};
