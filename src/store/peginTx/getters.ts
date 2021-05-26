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
  [constants.PEGIN_TX_GET_CHANGE_ADDRESS]: (state: PegInTxState) => {
    let address = '';
    const coin = process.env.VUE_APP_COIN ?? 'test';
    const coinPath = coin === 'main' ? "/0'" : "/1'";
    // eslint-disable-next-line no-unused-expressions
    state.addressList?.forEach((walletAddress) => {
      if (walletAddress.serializedPath === `m/44'${coinPath}/0'/1/0`) address = walletAddress.address;
    });
    return address;
  },
  [constants.PEGIN_TX_GET_REFUND_ADDRESS]: (state: PegInTxState) => {
    let address = '';
    const coin = process.env.VUE_APP_COIN ?? 'test';
    const coinPath = coin === 'main' ? "/0'" : "/1'";
    // eslint-disable-next-line no-unused-expressions
    state.addressList?.forEach((walletAddress) => {
      if (walletAddress.serializedPath === `m/44'${coinPath}/0'/0/0`) address = walletAddress.address;
    });
    return address;
  },
  [constants.PEGIN_TX_GET_BIP32_DERIVATION_PATH_FROM_ADDRESS]:
    (state: PegInTxState) => (address: string): string => {
      let path = '';
      // eslint-disable-next-line no-unused-expressions
      state.addressList?.forEach((walletAddress) => {
        if (walletAddress.address === address) {
          const bip44Path = walletAddress.serializedPath.slice(2);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [coinPath, account, change, idx] = bip44Path.slice(4).split('/');
          path = `${account}/${change}/${idx}`;
        }
      });
      return path;
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
