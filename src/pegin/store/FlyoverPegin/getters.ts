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
};
