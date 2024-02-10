import { FlyoverPegoutState, RootState } from '@/common/types';
import { GetterTree } from 'vuex';
import * as constants from '@/common/store/constants';

export const getters: GetterTree<FlyoverPegoutState, RootState> = {
  [constants.FLYOVER_PEGOUT_GET_PROVIDER_ID]: (state) => (quoteHash: string): number => {
    let id = -1;
    Object.entries(state.quotes).forEach(([providerId, quotes]) => {
      const selectedQuote = quotes.find((quote) => quote.quoteHash === quoteHash);
      if (selectedQuote) {
        id = Number(providerId);
      }
    });
    return id;
  },
  [constants.FLYOVER_PEGOUT_GET_SELECTED_QUOTE]: (state) => {
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
