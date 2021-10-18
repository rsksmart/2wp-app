import { GetterTree } from 'vuex';
import * as constants from '@/store/constants';
import { PegInTxState } from './types';
import { RootState } from '../types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

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
  [constants.PEGIN_TX_GET_CHANGE_ADDRESS]:
    (state: PegInTxState) => (accountType: string): string => {
      let address = '';
      let accountTypePath = '';
      const coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
      const coinPath = coin === 'main' ? "/0'" : "/1'";
      switch (accountType) {
        case constants.BITCOIN_LEGACY_ADDRESS:
          accountTypePath = "44'";
          break;
        case constants.BITCOIN_SEGWIT_ADDRESS:
          accountTypePath = "49'";
          break;
        case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
          accountTypePath = "84'";
          break;
        default:
          accountTypePath = "44'";
      }
    // eslint-disable-next-line no-unused-expressions
    state.addressList?.forEach((walletAddress) => {
      if (walletAddress.serializedPath === `m/${accountTypePath}${coinPath}/0'/1/0`) address = walletAddress.address;
    });
    return address;
    },
  [constants.PEGIN_TX_GET_REFUND_ADDRESS]: (state: PegInTxState) => {
    let address = '';
    const coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
    const coinPath = coin === 'main' ? "/0'" : "/1'";
    // eslint-disable-next-line no-unused-expressions
    state.addressList?.forEach((walletAddress) => {
      if (walletAddress.serializedPath === `m/44'${coinPath}/0'/0/0`) address = walletAddress.address;
    });
    return address;
  },
  [constants.PEGIN_TX_GET_BIP44_DERIVATION_PATH_FROM_ADDRESS]:
    (state: PegInTxState) => (address: string): string => {
      let path = '';
      // eslint-disable-next-line no-unused-expressions
      state.addressList?.forEach((walletAddress) => {
        if (walletAddress.address === address) {
          path = walletAddress.serializedPath.slice(2);
        }
      });
      return path;
    },
  [constants.PEGIN_TX_GET_ADDRESS_PUBLIC_KEY]:
    (state: PegInTxState) => (address: string): string => {
      let publicKey = '';
      // eslint-disable-next-line no-unused-expressions
      state.addressList?.forEach((walletAddress) => {
        if (walletAddress.publicKey && walletAddress.address === address) {
          publicKey = walletAddress.publicKey;
        }
      });
      return publicKey;
    },
};
