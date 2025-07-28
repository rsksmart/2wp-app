import {
  FlyoverPeginState, LiquidityProvider2WP, PeginQuote, SatoshiBig,
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
  [constants.FLYOVER_PEGIN_SET_QUOTES]: (state, quotes: Record<number, Array<PeginQuote>>) => {
    state.quotes = quotes;
  },
  [constants.FLYOVER_PEGIN_SET_SELECTED_QUOTE]: (state, quoteHash: string) => {
    state.selectedQuoteHash = quoteHash;
  },
  [constants.FLYOVER_PEGIN_PROVIDERS_SET_AVAILABLE_LIQUIDITY]: (state, payload) => {
    const { providerId, peginLiquidity } = payload;
    const providers = state.liquidityProviders;
    providers.forEach((provider, idx) => {
      if (provider.id === providerId) {
        state.liquidityProviders[idx].pegin.availableLiquidity = peginLiquidity;
      }
    });
  },
  [constants.FLYOVER_PEGIN_SET_ACCEPTED_QUOTE_SIGNATURE]: (state, quoteSignature: string) => {
    state.acceptedQuoteSignature = quoteSignature;
  },
  [constants.FLYOVER_PEGIN_SET_QR_DESTINATION_ADDRESS]: (state, { quoteHash, btcAddress }) => {
    Object.entries(state.quotes).forEach(async ([, quotes]) => {
      const selectedQuote = quotes.find((quote) => quote.quoteHash === quoteHash);
      if (selectedQuote) {
        const qrCode = await state.flyoverService.flyover?.generateQrCode(
          btcAddress,
          selectedQuote.valueToTransfer.toBTCString(),
          constants.QRCodeNetworks.BITCOIN,
        ) ?? '';
        selectedQuote.qrCode = qrCode;
        selectedQuote.recipientBtcAddress = btcAddress;
      }
    });
  },
};
