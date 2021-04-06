import { GetterTree } from 'vuex';
import * as constants from '@/store/constants';
import { PegInTxState } from './types';
import { RootState } from '../types';

export const getters: GetterTree<PegInTxState, RootState> = {
  [constants.WALLET_NAME]: (state) => {
    switch (state.bitcoinWallet) {
      case constants.WALLET_LEDGER: {
        return 'Ledger';
      }
      case constants.WALLET_TREZOR: {
        return 'Trezor';
      }
      case constants.WALLET_ELECTRUM: {
        return 'Electrum';
      }
      case constants.WALLET_RWALLET: {
        return 'RWallet';
      }
      case constants.WALLET_DEFIANT: {
        return 'Defiant';
      }
      default: {
        return 'wallet';
      }
    }
  },
};
